import React, { useState, useEffect, useCallback } from 'react';
import Timer from './components/Timer';
import FullscreenVideo from './components/FullscreenVideo';
import Level1 from './pages/Level1';
import Level2 from './pages/Level2';
import Level3 from './pages/Level3';
import Thankyou from './pages/Thankyou';
import Terminated from './pages/Terminated';
import LostGame from './pages/LostGame';

// --- LOCAL STORAGE & FRONTEND-ONLY LOGIC ---

// Helper to get the list of UIDs already used on this browser
const getUsedUidsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('usedUids_escapeIsland') || '[]');
  } catch (e) {
    console.error("Failed to parse used UIDs from localStorage", e);
    return [];
  }
};

// Helper to save a UID as "used" in this browser's storage
const markUidAsUsedInStorage = (uid) => {
  if (!uid) return;
  const usedUids = getUsedUidsFromStorage();
  if (!usedUids.includes(uid)) {
    usedUids.push(uid);
    localStorage.setItem('usedUids_escapeIsland', JSON.stringify(usedUids));
  }
};

// Checks for a persisted termination state upon page load
const getInitialState = () => {
  try {
    const terminationInfo = localStorage.getItem('terminationInfo_escapeIsland');
    if (terminationInfo) {
      const parsedInfo = JSON.parse(terminationInfo);
      return {
        initialGameState: 'terminated',
        initialReason: parsedInfo.reason || 'A rule violation was detected.'
      };
    }
  } catch (error) {
    console.error("Failed to parse termination info from localStorage", error);
  }
  return { initialGameState: 'login', initialReason: '' };
};

function App() {
  const { initialGameState, initialReason } = getInitialState();
  const [uid, setUid] = useState(null);
  const [gameState, setGameState] = useState(initialGameState);
  const [scores, setScores] = useState({ level1: 0, level2: 0, level3: 0 });
  const [terminationReason, setTerminationReason] = useState(initialReason);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // --- LOCAL UID RECORDING (Replaces API call) ---
  const finalizeTestAndRecordUid = useCallback((currentUid) => {
    console.log(`FRONTEND: Finalizing and recording UID: ${currentUid} to localStorage.`);
    markUidAsUsedInStorage(currentUid);
  }, []);

  // --- ANTI-CHEAT & TERMINATION ---
  const handleTerminate = useCallback((reason) => {
    if (gameState === 'terminated') return;
    localStorage.setItem('terminationInfo_escapeIsland', JSON.stringify({ reason }));
    finalizeTestAndRecordUid(uid);
    setTerminationReason(reason);
    setGameState('terminated');
  }, [gameState, uid, finalizeTestAndRecordUid]);
  
  // Effect to manage fullscreen and anti-cheat listeners
  useEffect(() => {
    if (!gameState.startsWith('level')) return;
    
    const handleFullscreenChange = () => { if (!document.fullscreenElement) handleTerminate('Exited fullscreen mode.'); };
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') handleTerminate('Switched to another tab or window.'); };
    const handleDevTools = (e) => { if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) { e.preventDefault(); handleTerminate('Developer tools were opened.'); } };
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => { if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) { e.preventDefault(); handleTerminate('Copy/paste actions are disabled.'); } };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleDevTools);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleCopyPaste);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleDevTools);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleCopyPaste);
    };
  }, [gameState, handleTerminate]);

  useEffect(() => {
    const requiresFullscreen = gameState.startsWith('level');
    if (requiresFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error("Could not enter fullscreen:", err));
    } else if (!requiresFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Could not exit fullscreen:", err));
    }
  }, [gameState]);

  // --- FRONTEND-ONLY LOGIN LOGIC (Replaces API call) ---
  const handleLogin = async (enteredUid) => {
    if (!enteredUid.trim()) {
      setError('UID cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // 1. Fetch the list of valid UIDs from the public file
      const response = await fetch('/users.json');
      if (!response.ok) throw new Error('Could not load user validation file.');
      const validUsers = await response.json();
      
      // 2. Check if the entered UID is in the valid list
      const isValidUid = validUsers.some(user => user.uid === enteredUid);
      if (!isValidUid) {
        throw new Error('Invalid UID. Please check your credentials and try again.');
      }

      // 3. Check if the UID has already been used on this browser
      const usedUids = getUsedUidsFromStorage();
      if (usedUids.includes(enteredUid)) {
        throw new Error('This UID has already been used on this browser.');
      }
      
      // If all checks pass, log the user in
      setUid(enteredUid);
      setGameState('intro1');

    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Game State Transitions ---
  const startLevel = (level) => { setGameState(level); setTimerKey(p => p + 1); };
  const handleLevel1Complete = (score) => { setScores(p => ({ ...p, level1: score })); setGameState('intro2'); };
  const handleLevel2Complete = (score) => {
    const newScores = { ...scores, level1: scores.level1, level2: score };
    setScores(newScores);
    if (newScores.level1 + newScores.level2 >= 35) {
      setGameState('intro3');
    } else {
      finalizeTestAndRecordUid(uid);
      setGameState('lost');
    }
  };
  const handleLevel3Complete = (score) => { setScores(p => ({ ...p, level3: score })); finalizeTestAndRecordUid(uid); setGameState('introFinal'); };

  // --- Render Logic ---
  const renderHeader = () => {
    const config = {
      level1: { duration: 20 * 60, title: 'Round 1: Multiple Choice' },
      level2: { duration: 20 * 60, title: 'Round 2: Debugging' },
      level3: { duration: 35 * 60, title: 'Round 3: Final Challenge' },
    }[gameState];
    if (!config) return null;
    return (
      <header className="fixed top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-mono text-green-400"><Timer key={timerKey} duration={config.duration} onTimeUp={() => handleTerminate(`Time ran out for ${config.title}.`)} /></span>
          <h2 className="text-lg font-semibold text-gray-200">{config.title}</h2>
        </div>
        <h1 className="text-xl font-bold tracking-wider">FutureX – Error Island</h1>
      </header>
    );
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'login': return <LoginPage onLogin={handleLogin} error={error} isLoading={isLoading} />;
      case 'intro1': return <FullscreenVideo videoSrc="/00.mp4" buttonText="Start Round 1" onButtonClick={() => startLevel('level1')} />;
      case 'level1': return <Level1 onComplete={handleLevel1Complete} />;
      case 'intro2': return <FullscreenVideo videoSrc="/02.mp4" buttonText="Proceed to Round 2" onButtonClick={() => startLevel('level2')} />;
      case 'level2': return <Level2 onComplete={handleLevel2Complete} />;
      case 'intro3': return <FullscreenVideo videoSrc="/03.mp4" buttonText="Start Final Round" onButtonClick={() => startLevel('level3')} />;
      case 'level3': return <Level3 onComplete={handleLevel3Complete} />;
      case 'introFinal': return <FullscreenVideo videoSrc="/tq.mp4" buttonText="See Final Score" onButtonClick={() => setGameState('thankyou')} />;
      case 'thankyou': return <Thankyou scores={scores} />;
      case 'lost': return <LostGame scores={scores} />;
      case 'terminated': return <Terminated reason={terminationReason} />;
      default: return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {renderHeader()}
      <main className={gameState.startsWith('level') ? 'pt-20' : ''}>{renderGameState()}</main>
    </div>
  );
}

// LoginPage remains mostly the same, as its props are unchanged.
const LoginPage = ({ onLogin, error, isLoading }) => {
  const [inputUid, setInputUid] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onLogin(inputUid); };
  // ... rest of LoginPage JSX is unchanged
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover z-0" src="/lp.mp4" />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60 z-10" />
      <div className="relative z-20 p-10 bg-gray-900 bg-opacity-70 rounded-2xl shadow-2xl backdrop-blur-md border border-green-500/50 w-full max-w-md text-center">
        <h1 className="text-4xl font-mono tracking-widest uppercase font-bold mb-2 text-green-400">Escape from the Error Island</h1>
        <p className="text-lg text-gray-300 mb-8">FutureX 2025 Technical Challenge</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputUid}
            onChange={(e) => setInputUid(e.target.value)}
            placeholder="Enter Your Unique ID (UID)"
            className="w-full px-4 py-3 bg-gray-800 text-white font-mono border-2 border-green-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={isLoading}
          />
          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Access Challenge'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 animate-pulse font-semibold">{error}</p>}
      </div>
    </div>
  );
};

export default App;


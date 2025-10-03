import React, { useState, useEffect, useCallback } from 'react';
import Timer from './components/Timer';
import FullscreenVideo from './components/FullscreenVideo';
import Level1 from './pages/Level1';
import Level2 from './pages/Level2';
import Level3 from './pages/Level3';
import Thankyou from './pages/Thankyou';
import Terminated from './pages/Terminated';
import LostGame from './pages/LostGame'; // Import the new component

const API_URL = '/api'; // Base URL for the backend API

// Helper function to read initial state from localStorage
const getInitialState = () => {
  try {
    const terminationInfo = localStorage.getItem('terminationInfo');
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

  // --- API COMMUNICATION ---
  const finalizeTestAndRecordUid = useCallback(async (currentUid) => {
    if (!currentUid) {
      console.error("FRONTEND: Cannot record UID because it's not set.");
      return;
    }
    console.log(`%cFRONTEND: Attempting to finalize and record UID: ${currentUid}`, "color: yellow; font-weight: bold;");
    try {
      const response = await fetch(`${API_URL}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUid }),
      });
      if (response.ok) {
        console.log(`%cFRONTEND: Successfully sent completion signal for UID: ${currentUid}`, "color: green;");
      } else {
        const data = await response.json();
        console.error(`%cFRONTEND: Server responded with an error for UID completion: ${response.status}`, "color: red;", data.message);
      }
    } catch (error) {
      console.error("%cFRONTEND: Network error failed to record UID completion:", "color: red;", error);
    }
  }, []);

  // --- ANTI-CHEAT & TERMINATION ---
  const handleTerminate = useCallback((reason) => {
    if (gameState === 'terminated') return;

    localStorage.setItem('terminationInfo', JSON.stringify({ reason }));

    console.warn(`FRONTEND: Termination triggered. Reason: ${reason}`);
    finalizeTestAndRecordUid(uid);
    setTerminationReason(reason);
    setGameState('terminated');
    // The fullscreen management useEffect will handle exiting fullscreen automatically.
  }, [gameState, uid, finalizeTestAndRecordUid]);
  
  // This useEffect handles the anti-cheat rules.
  useEffect(() => {
    // Only apply rules when the user is in an active test level.
    if (!gameState.startsWith('level')) {
      return;
    }
    
    const handleFullscreenChange = () => { if (!document.fullscreenElement) handleTerminate('Exited fullscreen mode.'); };
    const handleVisibilityChange = () => { if (document.visibilityState === 'hidden') handleTerminate('Switched to another tab or window.'); };
    const handleDevTools = (e) => { if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) { e.preventDefault(); handleTerminate('Developer tools were opened.'); } };
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => { if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) { e.preventDefault(); handleTerminate('Copy/paste/cut actions are disabled.'); } };
    
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
  
  // This new useEffect declaratively manages the fullscreen state.
  useEffect(() => {
    const requiresFullscreen = gameState.startsWith('level');
    
    if (requiresFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Could not enter fullscreen:", err);
        setError("Fullscreen is required to start the test. Please enable it and try again.");
        setGameState(prev => prev.replace('level', 'intro')); // Revert to intro screen on failure
      });
    } else if (!requiresFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Could not exit fullscreen:", err));
    }
  }, [gameState]);


  // --- GAME LOGIC & STATE TRANSITIONS ---
  const handleLogin = async (enteredUid) => {
    if (!enteredUid.trim()) {
      setError('UID cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: enteredUid }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');
      setUid(enteredUid);
      setGameState('intro1');
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startLevel = (level) => {
    setGameState(level);
    setTimerKey(prev => prev + 1); // Reset timer for the new level
  };

  const handleLevel1Complete = (score) => {
    setScores(prev => ({ ...prev, level1: score }));
    setGameState('intro2');
  };

  const handleLevel2Complete = (score) => {
    const newScores = { ...scores, level1: scores.level1, level2: score };
    setScores(newScores);
    if (newScores.level1 + newScores.level2 >= 35) {
      setGameState('intro3');
    } else {
      finalizeTestAndRecordUid(uid);
      setGameState('lost'); // Direct to the new 'lost' screen
    }
  };

  const handleLevel3Complete = (score) => {
    setScores(prev => ({ ...prev, level3: score }));
    finalizeTestAndRecordUid(uid);
    setGameState('introFinal');
  };

  // --- RENDER LOGIC ---
  const renderHeader = () => {
    const roundConfig = {
      level1: { duration: 20 * 60, title: 'Round 1: Multiple Choice' },
      level2: { duration: 20 * 60, title: 'Round 2: Debugging' },
      level3: { duration: 30 * 60, title: 'Round 3: Final Challenge' },
    };
    const config = roundConfig[gameState];
    if (!config) return null;

    return (
      <header className="fixed top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-mono text-green-400">
            <Timer key={timerKey} duration={config.duration} onTimeUp={() => handleTerminate(`Time ran out for ${config.title}.`)} />
          </span>
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
      case 'introFinal': return <FullscreenVideo videoSrc="/lp.mp4" buttonText="See Final Score" onButtonClick={() => setGameState('thankyou')} />;
      case 'thankyou': return <Thankyou scores={scores} />;
      case 'lost': return <LostGame scores={scores} />; // Render the new component
      case 'terminated': return <Terminated reason={terminationReason} />;
      default: return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {renderHeader()}
      <main className={gameState.startsWith('level') ? 'pt-20' : ''}>
        {renderGameState()}
      </main>
    </div>
  );
}

const LoginPage = ({ onLogin, error, isLoading }) => {
  const [inputUid, setInputUid] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onLogin(inputUid); };

  const customStyles = `
    @keyframes gradient-move {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient-move 8s ease infinite;
    }
    @keyframes float {
      0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.2; }
      25% { transform: translateY(-20px) translateX(15px) rotate(10deg); opacity: 0.5; }
      50% { transform: translateY(10px) translateX(-15px) rotate(-15deg); opacity: 0.3; }
      75% { transform: translateY(-15px) translateX(10px) rotate(5deg); opacity: 0.6; }
      100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.2; }
    }
    .float-symbol { position: absolute; font-size: 1.5rem; }
    .animate-float1 { top: 10%; left: 5%; animation: float 10s ease-in-out infinite; }
    .animate-float2 { top: 70%; left: 85%; animation: float 12s ease-in-out infinite reverse; }
    .animate-float3 { top: 80%; left: 10%; animation: float 9s ease-in-out infinite; }
    .animate-float4 { top: 20%; left: 90%; animation: float 14s ease-in-out infinite reverse; }
  `;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <style>{customStyles}</style>
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/lp.mp4"
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60 z-10"></div>
      <div className="relative z-20 p-10 bg-gray-900 bg-opacity-70 rounded-2xl shadow-2xl backdrop-blur-md border border-green-500/50 w-full max-w-md text-center">
        <h1 className="text-4xl font-mono tracking-widest uppercase font-bold mb-2 text-green-400">Escape from the Error Island</h1>
        <p className="text-lg text-gray-300 mb-8">FutureX 2025 Technical Challenge</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputUid}
            onChange={(e) => setInputUid(e.target.value)}
            placeholder="Enter Your Unique ID (UID)"
            className="w-full px-4 py-3 bg-gray-800 text-white font-mono border-2 border-green-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-green-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Challenge'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 animate-pulse font-semibold">{error}</p>}
      </div>
      <div className="relative z-20 mt-8 w-full max-w-lg p-1 rounded-2xl bg-gradient-to-r from-red-600 via-yellow-400 to-red-500 animate-gradient">
        <div className="relative bg-gray-900 rounded-xl p-4 overflow-hidden">
          <span className="float-symbol animate-float1">⚠️</span>
          <span className="float-symbol animate-float2">❌</span>
          <span className="float-symbol animate-float3">⚡</span>
          <span className="float-symbol animate-float4">🚫</span>
          <p className="text-gray-200 text-sm text-center relative z-10">
            <span className="font-bold text-yellow-300 uppercase">Important Note:</span> The test will run in fullscreen mode. Any attempt to exit, switch tabs, or use developer tools will result in immediate disqualification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
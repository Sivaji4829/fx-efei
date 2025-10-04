import React, { useState, useEffect } from 'react';
import ScoreBanner from './ScoreBanner';
import ConfirmationModal from './ConfirmationModal';
import LanguageSelector from './LanguageSelector';

const CodingChallenge = ({ questions, onComplete, roundTitle, totalMarks }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCodes, setUserCodes] = useState({});
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testPassStatus, setTestPassStatus] = useState({});
  const [showHints, setShowHints] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const initialCodes = {};
    questions.forEach(q => {
      initialCodes[q.id] = q.startingCode || '';
    });
    setUserCodes(initialCodes);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];

  // --- Smart Evaluation Logic ---
  const handleRunCode = () => {
    const userCode = userCodes[currentQuestion.id] || '';
    const solutionCode = currentQuestion.correctedCode || '';
    const formattedUserCode = userCode.replace(/\s+/g, '').toLowerCase();
    const formattedSolutionCode = solutionCode.replace(/\s+/g, '').toLowerCase();

    let output = `--- Simulating ${currentQuestion.language.toUpperCase()} Execution ---\n\n`;
    if (formattedUserCode && formattedSolutionCode.includes(formattedUserCode)) {
      output += 'Code logic appears correct.\n';
      output += 'Simulated Output:\n' + currentQuestion.testCases.map(tc => tc.output).join('\n') + '\n\n';
      output += 'Result: PASSED ✅\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: true }));
    } else {
      output += 'Code does not match the expected solution.\nResult: FAILED ❌\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: false }));
    }
    setConsoleOutput(output);
  };
  
  const calculateScore = () => {
    let score = 0;
    const marksPerQuestion = totalMarks / questions.length;
    questions.forEach(question => {
      if (testPassStatus[question.id]) {
        score += marksPerQuestion;
      }
    });
    return Math.round(score);
  };

  const handleConfirmSubmit = () => {
    const score = calculateScore();
    setFinalScore(score);
    setShowScore(true);
    setIsConfirming(false);
    setTimeout(() => onComplete(score), 3000);
  };
  
  const handleCodeChange = (e) => setUserCodes({ ...userCodes, [currentQuestion.id]: e.target.value });
  const changeQuestion = (newIndex) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setConsoleOutput('');
      setShowHints(false);
      setCurrentQuestionIndex(newIndex);
    }
  };

  const resetCode = () => {
    setUserCodes({ ...userCodes, [currentQuestion.id]: currentQuestion.startingCode });
    setConsoleOutput('Code has been reset to the initial snippet.');
  };

  if (showScore) return <ScoreBanner title={`${roundTitle} Complete!`} score={finalScore} totalMarks={totalMarks} message="Preparing for the final results..." />;
  if (!currentQuestion) return <div className="flex items-center justify-center h-screen">Loading Challenge...</div>;

  return (
    <>
      {/* Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover" src="/03.mp4" />
        <div className="absolute top-0 left-0 w-full h-full"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-screen flex flex-col p-4">
        <ConfirmationModal isOpen={isConfirming} title="Submit Final Answers?" message="This action is final and cannot be undone." onConfirm={handleConfirmSubmit} onCancel={() => setIsConfirming(false)} />
        
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow pt-16 min-h-0">
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            
            {/* Left Panel: Problem Description */}
            <div className="bg-transparent bg-opacity-40 backdrop-blur-sm rounded-lg p-6 flex flex-col border border-gray-700 overflow-y-auto">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white">{currentQuestion.title}</h2>
                <span className="text-xs font-bold bg-yellow-500 text-black px-2 py-1 rounded-full">Round 3</span>
              </div>
              <p className="text-gray-300 mb-6 whitespace-pre-wrap">{currentQuestion.description}</p>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples:</h3>
              <div className="bg-transparent bg-opacity-50 rounded-md p-4 text-sm space-y-4 mb-6 font-mono">
                {currentQuestion.testCases.map((tc, index) => (
                  <div key={index}>
                    <p className="text-gray-400">Input: <code className="text-white bg-gray-700 px-1 rounded">{tc.input || 'N/A'}</code></p>
                    <p className="text-gray-400">Output: <code className="text-white bg-gray-700 px-1 rounded">{tc.output}</code></p>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <button onClick={() => setShowHints(!showHints)} className="text-cyan-400 hover:text-cyan-300 transition text-sm">
                  {showHints ? 'Hide Approach' : 'Show Approach'}
                </button>
                {showHints && (
                  <div className="mt-2 p-3 bg-transparent bg-opacity-10 rounded-md text-sm space-y-2 border border-gray-600">
                    {/* --- DEFINITIVE FIX --- */}
                    {/* Now correctly displays 'approach' and 'hint' from your JSON */}
                    {currentQuestion.approach && <p className="text-gray-300"><strong className="font-bold text-gray-100">Approach:</strong> {currentQuestion.approach}</p>}
                    {currentQuestion.hint && <p className="text-gray-300"><strong className="font-bold text-gray-100">Hint:</strong> {currentQuestion.hint}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Code Editor and Console */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="bg-transparent bg-opacity-40 backdrop-blur-sm rounded-lg p-1 flex flex-col border border-gray-700 flex-grow">
                <div className="flex justify-between items-center p-3 border-b border-gray-700">
                  <span className="text-sm font-semibold text-gray-300">{currentQuestion.language}</span>
                  <div className="flex items-center gap-2">
                      <button onClick={handleRunCode} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md transition text-sm">Run</button>
                      <button onClick={resetCode} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition text-sm">Reset</button>
                  </div>
                </div>
                <textarea value={userCodes[currentQuestion.id] || ''} onChange={handleCodeChange} className="w-full flex-grow bg-gray-900 text-white font-mono p-4 rounded-b-lg focus:outline-none resize-none" spellCheck="false" />
              </div>

              <div className="bg-transparent bg-opacity-40 backdrop-blur-sm rounded-lg p-4 flex flex-col border border-gray-700 h-2/5">
                <h3 className="text-base font-semibold text-gray-300 mb-2">Test Result:</h3>
                <pre className="w-full flex-grow bg-transparent text-white font-mono text-xs p-3 rounded-md border border-gray-600 whitespace-pre-wrap overflow-auto">{consoleOutput || 'Click "Run" to see test results.'}</pre>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 p-2 bg-transparent bg-opacity-40 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
            <div>
                <button onClick={() => changeQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="bg-red-600 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition disabled:opacity-70">Previous</button>
                <button onClick={() => changeQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= questions.length - 1} className="bg-blue-500 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition ml-2 disabled:opacity-50">Next</button>
            </div>
            <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
            <button onClick={() => setIsConfirming(true)} className="bg-green-500 hover:bg-green-700 font-bold py-2 px-6 rounded-lg transition">Submit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodingChallenge;
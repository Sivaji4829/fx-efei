import React, { useState, useEffect } from 'react';
import ScoreBanner from './ScoreBanner';
import ConfirmationModal from './ConfirmationModal';
import LanguageSelector from './LanguageSelector';

// --- Main Component for the Interactive Coding Round ---
const SnippetSolvingRound = ({ questions, onComplete, roundTitle, totalMarks, showLanguageSelector = true }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCodes, setUserCodes] = useState({});
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testPassStatus, setTestPassStatus] = useState({}); // Tracks pass/fail state for scoring
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const initialCodes = {};
    questions.forEach(q => {
      initialCodes[q.id] = q.startingCode;
    });
    setUserCodes(initialCodes);
    if (questions.length > 0) {
      setSelectedLanguage(questions[0].language);
    }
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];

  // --- Safe JavaScript Code Execution ---
  const runJavaScriptCode = (code) => {
    let output = '';
    let passedCount = 0;
    const testCases = currentQuestion.testCases || [];
    
    if (testCases.length === 0) {
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: true }));
      return "No automated test cases for this question. Assumed correct for prototype.";
    }

    const capturedLogs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };

    try {
      new Function(code)(); 
      const actualOutput = capturedLogs.join('\n').trim();
      
      testCases.forEach((test, index) => {
        const expectedOutput = (test.output || '').trim();
        output += `Running Test Case ${index + 1}...\n`;
        output += `Expected Output:\n'${expectedOutput}'\n\n`;
        output += `Your Actual Output:\n'${actualOutput}'\n\n`;
        if (actualOutput === expectedOutput) {
          output += 'Result: PASSED ✅\n\n';
          passedCount++;
        } else {
          output += 'Result: FAILED ❌\n\n';
        }
      });
    } catch (e) {
      output = `Runtime Error: ${e.message}\n\nPlease check your code for errors.`;
    } finally {
      console.log = originalConsoleLog;
    }

    const allTestsPassed = passedCount === testCases.length;
    setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: allTestsPassed }));
    output += `--- Summary: ${passedCount} / ${testCases.length} Test Cases Passed ---`;
    return output;
  };

  // --- "Smart" Simulation for Non-JS Languages (Corrected) ---
  const simulateNonJSExecution = (userCode) => {
    let output = `--- Simulating ${currentQuestion.language.toUpperCase()} Execution ---\n\n`;
    const solutionCode = currentQuestion.correctedCode || '';

    // Normalize both user's code and solution for a more flexible comparison
    const formattedUserCode = userCode.replace(/\s+/g, '').toLowerCase();
    const formattedSolutionCode = solutionCode.replace(/\s+/g, '').toLowerCase();

    // --- DEFINITIVE FIX ---
    // Instead of an exact match, we check if the solution INCLUDES the user's corrected code.
    // This allows users to submit just the fixed line(s) without needing extra boilerplate like print statements.
    if (formattedUserCode && formattedSolutionCode.includes(formattedUserCode)) {
      output += 'Code matches the core logic of the expected solution.\n\n';
      output += 'Simulated Output:\n';
      const expectedOutput = currentQuestion.testCases.map(tc => tc.output).join('\n');
      output += expectedOutput + '\n\n';
      output += 'Result: PASSED ✅\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: true }));
    } else {
      output += 'Code does not match the expected solution.\n';
      output += 'Please review your code and try again.\n\n';
      output += 'Result: FAILED ❌\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: false }));
    }
    return output;
  };


  const handleRunCode = () => {
    const codeToRun = userCodes[currentQuestion.id] || '';
    if (currentQuestion.language === 'javascript') {
      const output = runJavaScriptCode(codeToRun);
      setConsoleOutput(output);
    } else {
      const output = simulateNonJSExecution(codeToRun);
      setConsoleOutput(output);
    }
  };

  // --- Scoring Logic ---
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
    // Run all tests one last time before submitting to ensure scores are up to date
    questions.forEach(q => {
        const codeToRun = userCodes[q.id] || '';
        if (q.language === 'javascript') {
            runJavaScriptCode(codeToRun);
        } else {
            simulateNonJSExecution(codeToRun);
        }
    });

    // Short delay to allow state updates from the final test runs
    setTimeout(() => {
        const score = calculateScore();
        setFinalScore(score);
        setShowScore(true);
        setIsConfirming(false);
        setTimeout(() => {
          onComplete(score);
        }, 3000);
    }, 500);
  };

  // --- Navigation ---
  const handleCodeChange = (e) => setUserCodes({ ...userCodes, [currentQuestion.id]: e.target.value });
  const changeQuestion = (newIndex) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setConsoleOutput('');
      setCurrentQuestionIndex(newIndex);
      setSelectedLanguage(questions[newIndex].language);
    }
  };

  if (showScore) {
    return <ScoreBanner title={`${roundTitle} Complete!`} score={finalScore} totalMarks={totalMarks} message="Preparing for the next phase..." />;
  }
  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-screen">Loading Challenge...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-24 flex flex-col">
      <ConfirmationModal isOpen={isConfirming} title="Submit Final Answers?" message="This action is final and cannot be undone." onConfirm={handleConfirmSubmit} onCancel={() => setIsConfirming(false)} />
      <h1 className="text-3xl font-bold text-center mb-6 text-green-400">{roundTitle}</h1>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel: Problem */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col border border-gray-700">
          <h2 className="text-2xl font-semibold mb-3">
            Question {currentQuestionIndex + 1} / {questions.length}: <span className="text-yellow-400">{currentQuestion.title}</span>
          </h2>
          <p className="text-gray-300 mb-4">{currentQuestion.description}</p>
          <h3 className="text-lg font-semibold mt-auto mb-2 text-red-400">Buggy Code Snippet:</h3>
          <pre className="bg-black rounded-md p-4 text-sm whitespace-pre-wrap overflow-x-auto"><code>{currentQuestion.startingCode}</code></pre>
        </div>
        
        {/* Middle Panel: Code Editor */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-green-400">Your Corrected Code:</h3>
            {showLanguageSelector && <LanguageSelector selectedLanguage={currentQuestion.language} onSelect={() => {}} />}
          </div>
          <textarea value={userCodes[currentQuestion.id] || ''} onChange={handleCodeChange} className="w-full flex-grow bg-black text-white font-mono p-4 rounded-md border border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" spellCheck="false" />
        </div>
        
        {/* Right Panel: Console & Actions */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col border border-gray-700">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Console Output:</h3>
          <pre className="w-full flex-grow bg-black text-white font-mono text-sm p-4 rounded-md border border-gray-600 whitespace-pre-wrap overflow-auto">{consoleOutput || 'Click "Run Code" to see the output here.'}</pre>
          <div className="mt-4">
            <button onClick={handleRunCode} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">Run Code</button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex justify-between items-center mt-6 p-4 bg-gray-800 rounded-lg shadow-lg">
        <button onClick={() => changeQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">Previous</button>
        <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
        {currentQuestionIndex < questions.length - 1 ? (
          <button onClick={() => changeQuestion(currentQuestionIndex + 1)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition">Next</button>
        ) : (
          <button onClick={() => setIsConfirming(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition animate-pulse">Submit Final Answers</button>
        )}
      </div>
    </div>
  );
};

export default SnippetSolvingRound;
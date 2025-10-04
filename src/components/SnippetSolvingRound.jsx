import React, { useState, useEffect } from 'react';
import ScoreBanner from './ScoreBanner';
import ConfirmationModal from './ConfirmationModal';
import LanguageSelector from './LanguageSelector';

const SnippetSolvingRound = ({ questions, onComplete, roundTitle, totalMarks, showLanguageSelector = true }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCodes, setUserCodes] = useState({});
  const [consoleOutput, setConsoleOutput] = useState('');
  const [testPassStatus, setTestPassStatus] = useState({});
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

  const runJavaScriptCode = (code) => {
    let output = '';
    let passedCount = 0;
    const testCases = currentQuestion.testCases || [];
    if (testCases.length === 0) {
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: true }));
      return "No automated test cases. Assumed correct.";
    }
    const capturedLogs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => capturedLogs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    try {
      new Function(code)();
      const actualOutput = capturedLogs.join('\n').trim();
      testCases.forEach((test, index) => {
        const expectedOutput = (test.output || '').trim();
        output += `Test Case ${index + 1}:\nExpected: '${expectedOutput}'\nActual:   '${actualOutput}'\n`;
        if (actualOutput === expectedOutput) {
          output += 'Result: PASSED ✅\n\n';
          passedCount++;
        } else {
          output += 'Result: FAILED ❌\n\n';
        }
      });
    } catch (e) {
      output = `Runtime Error: ${e.message}`;
    } finally {
      console.log = originalConsoleLog;
    }
    const allTestsPassed = passedCount === testCases.length;
    setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: allTestsPassed }));
    output += `--- Summary: ${passedCount}/${testCases.length} Passed ---`;
    return output;
  };
  
  const simulateNonJSExecution = (userCode) => {
    let output = `--- Simulating ${currentQuestion.language.toUpperCase()} ---\n\n`;
    const solutionCode = currentQuestion.correctedCode || '';
    const formattedUserCode = userCode.replace(/\s+/g, '').toLowerCase();
    const formattedSolutionCode = solutionCode.replace(/\s+/g, '').toLowerCase();

    if (formattedUserCode && formattedSolutionCode.includes(formattedUserCode)) {
      output += 'Code logic appears correct.\n';
      output += 'Simulated Output:\n' + currentQuestion.testCases.map(tc => tc.output).join('\n') + '\n\n';
      output += 'Result: PASSED ✅\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: true }));
    } else {
      output += 'Code does not match the expected solution.\nResult: FAILED ❌\n';
      setTestPassStatus(prev => ({ ...prev, [currentQuestion.id]: false }));
    }
    return output;
  };

  const handleRunCode = () => {
    const codeToRun = userCodes[currentQuestion.id] || '';
    if (currentQuestion.language === 'javascript') {
      setConsoleOutput(runJavaScriptCode(codeToRun));
    } else {
      setConsoleOutput(simulateNonJSExecution(codeToRun));
    }
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
    // Run all tests one last time to ensure scores are up to date
    questions.forEach((q, index) => {
      const codeToRun = userCodes[q.id] || '';
      if (q.language === 'javascript') {
        runJavaScriptCode(codeToRun);
      } else {
        simulateNonJSExecution(codeToRun);
      }
    });
    setTimeout(() => {
        const score = calculateScore();
        setFinalScore(score);
        setShowScore(true);
        setIsConfirming(false);
        setTimeout(() => onComplete(score), 3000);
    }, 500);
  };

  const handleCodeChange = (e) => setUserCodes({ ...userCodes, [currentQuestion.id]: e.target.value });
  const changeQuestion = (newIndex) => {
    if (newIndex >= 0 && newIndex < questions.length) {
      setConsoleOutput('');
      setCurrentQuestionIndex(newIndex);
      setSelectedLanguage(questions[newIndex].language);
    }
  };

  if (showScore) return <ScoreBanner title={`${roundTitle} Complete!`} score={finalScore} totalMarks={totalMarks} message="Preparing for the next phase..." />;
  if (!currentQuestion) return <div className="flex items-center justify-center h-screen">Loading Challenge...</div>;

  return (
    <>
      {/* Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video autoPlay muted loop  className="absolute top-0 left-0 w-full h-full object-cover" src="/l2bg.mp4" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full min-h-screen flex flex-col p-4 pt-24">
        <ConfirmationModal isOpen={isConfirming} title="Submit Final Answers?" message="This action is final and cannot be undone." onConfirm={handleConfirmSubmit} onCancel={() => setIsConfirming(false)} />
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow">
          <h1 className="text-3xl font-bold text-center mb-6 text-green-400">{roundTitle}</h1>
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Panel: Problem */}
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 flex flex-col border border-gray-700">
              <h2 className="text-2xl font-semibold mb-3">
                Question {currentQuestionIndex + 1}/{questions.length}: <span className="text-yellow-400">{currentQuestion.title}</span>
              </h2>
              <p className="text-gray-300 mb-4">{currentQuestion.description}</p>
              <h3 className="text-lg font-semibold mt-auto mb-2 text-red-400">Buggy Code:</h3>
              <pre className="bg-black rounded-md p-4 text-sm whitespace-pre-wrap overflow-x-auto"><code>{currentQuestion.startingCode}</code></pre>
            </div>
            {/* Middle Panel: Code Editor */}
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 flex flex-col border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-green-400">Your Code:</h3>
                {showLanguageSelector && <LanguageSelector selectedLanguage={currentQuestion.language} onSelect={() => {}} />}
              </div>
              <textarea value={userCodes[currentQuestion.id] || ''} onChange={handleCodeChange} className="w-full flex-grow bg-black text-white font-mono p-4 rounded-md border border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" spellCheck="false" />
            </div>
            {/* Right Panel: Console */}
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 flex flex-col border border-gray-700">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Console:</h3>
              <pre className="w-full flex-grow bg-black text-white font-mono text-sm p-4 rounded-md border border-gray-600 whitespace-pre-wrap overflow-auto">{consoleOutput || 'Click "Run Code" to see output.'}</pre>
              <div className="mt-4">
                <button onClick={handleRunCode} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">Run Code</button>
              </div>
            </div>
          </div>
          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-6 p-4 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg backdrop-blur-sm">
            <button onClick={() => changeQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">Previous</button>
            <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
            {currentQuestionIndex < questions.length - 1 ? (
              <button onClick={() => changeQuestion(currentQuestionIndex + 1)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg transition">Next</button>
            ) : (
              <button onClick={() => setIsConfirming(true)} className="bg-red-600 hover:bg-red-700 font-bold py-2 px-6 rounded-lg transition animate-pulse">Submit Answers</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SnippetSolvingRound;
import React, { useState, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';

const CodingRound = ({ questions, onComplete, showLanguageSelector = false }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userCodes, setUserCodes] = useState({}); // { problemId: { code, lang } }
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState({}); // { problemId: { passed, total, results: [] } }

  const currentProblem = questions[currentProblemIndex];

  // Initialize userCodes state when questions are loaded
  useEffect(() => {
    const initialCodes = {};
    questions.forEach(q => {
      initialCodes[q.id] = {
        code: q.startingCode[language] || q.startingCode['javascript'],
        lang: language
      };
    });
    setUserCodes(initialCodes);
  }, [questions, language]);


  const handleCodeChange = (e) => {
    setUserCodes(prev => ({
      ...prev,
      [currentProblem.id]: { ...prev[currentProblem.id], code: e.target.value }
    }));
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // update code in text area if not modified by user
    setUserCodes(prev => ({
      ...prev,
      [currentProblem.id]: { code: currentProblem.startingCode[lang], lang: lang }
    }));
  };

  const runTests = () => {
    if (language !== 'javascript') {
      alert("Auto-evaluation is only available for JavaScript. Your code will be saved for manual review.");
      return;
    }

    const userCode = userCodes[currentProblem.id]?.code;
    const testCases = currentProblem.testCases;
    let passedCount = 0;
    const results = [];

    testCases.forEach((test, index) => {
      try {
        // This is a simplified and somewhat unsafe way to execute code.
        // For a real app, use a web worker or a secure sandbox environment.
        const userFunction = new Function('return ' + userCode)();
        const result = userFunction(...test.input);

        // Simple comparison, for complex objects might need deep equality
        if (JSON.stringify(result) === JSON.stringify(test.expected)) {
          passedCount++;
          results.push({ test: `Test Case ${index + 1}`, status: 'Passed', output: result });
        } else {
          results.push({ test: `Test Case ${index + 1}`, status: 'Failed', output: result, expected: test.expected });
        }
      } catch (error) {
        results.push({ test: `Test Case ${index + 1}`, status: 'Error', output: error.message });
      }
    });

    setTestResults(prev => ({
      ...prev,
      [currentProblem.id]: {
        passed: passedCount,
        total: testCases.length,
        results: results,
      }
    }));
  };
  
  const handleSubmit = () => {
    // In a real app, this would send all userCodes to a backend.
    // Here we just calculate the score for JS.
    let totalScore = 0;
    
    // Evaluate all JS questions before submitting
    questions.forEach(q => {
        if (userCodes[q.id]?.lang === 'javascript') {
            const problemTestResults = testResults[q.id];
            if (problemTestResults && problemTestResults.passed === problemTestResults.total) {
                // simple scoring: 1 point per fully passed problem
                // This can be changed to partial points
                totalScore += (20 / 5); // Example for level 2
            }
        }
    });
    console.log("Final Codes:", userCodes);
    console.log("Final Score:", totalScore);
    onComplete(totalScore);
  };
  
  return (
    <div className="container mx-auto p-4 flex gap-4 h-[calc(100vh-80px)]">
      {/* Left Panel: Problem List */}
      <div className="w-1/4 bg-gray-800 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Problems</h2>
        <ul>
          {questions.map((q, index) => (
            <li key={q.id}
              className={`p-3 rounded-md cursor-pointer mb-2 transition ${currentProblemIndex === index ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setCurrentProblemIndex(index)}
            >
              {q.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel: Problem Details, Code Editor, and Tests */}
      <div className="w-3/4 flex flex-col gap-4">
        <div className="bg-gray-800 rounded-lg p-6 overflow-y-auto flex-grow">
          <h1 className="text-2xl font-bold mb-2">{currentProblem.title}</h1>
          <p className="text-gray-300 whitespace-pre-wrap">{currentProblem.description}</p>
          {showLanguageSelector && <LanguageSelector selectedLanguage={language} onSelect={handleLanguageChange} />}
        </div>
        
        <div className="flex flex-col flex-grow h-1/2">
          <textarea
              value={userCodes[currentProblem.id]?.code || ''}
              onChange={handleCodeChange}
              className="font-mono text-sm bg-gray-900 border border-gray-700 rounded-t-lg p-4 flex-grow w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your code here..."
              spellCheck="false"
          />
          <div className="bg-gray-800 p-2 rounded-b-lg flex justify-between items-center">
             <button onClick={runTests} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                Run Tests
            </button>
            <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
                Submit Final Answers
            </button>
          </div>
        </div>

        {testResults[currentProblem.id] && (
          <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto h-48">
            <h3 className="text-lg font-bold mb-2">Test Results: {testResults[currentProblem.id].passed} / {testResults[currentProblem.id].total} Passed</h3>
            <ul>
              {testResults[currentProblem.id].results.map((res, i) => (
                <li key={i} className={`p-2 rounded mb-1 font-mono text-sm ${res.status === 'Passed' ? 'bg-green-900' : res.status === 'Failed' ? 'bg-red-900' : 'bg-yellow-900'}`}>
                  <strong>{res.test}: {res.status}</strong>
                  {res.status !== 'Passed' && <p>Output: {JSON.stringify(res.output)} {res.expected && `| Expected: ${JSON.stringify(res.expected)}`}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingRound;

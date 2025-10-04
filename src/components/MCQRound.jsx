import React, { useState, useMemo } from 'react';
import ScoreBanner from './ScoreBanner';
import ConfirmationModal from './ConfirmationModal';

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MCQRound = ({ questions, onComplete, roundTitle }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  // --- Jumbled Options Logic ---
  const processedQuestions = useMemo(() => {
    return questions.map(q => {
      const correctAnswerText = q.options[q.correctAnswerIndex];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
      return { ...q, shuffledOptions, newCorrectAnswerIndex: newCorrectIndex };
    });
  }, [questions]);

  const currentQuestion = processedQuestions[currentQuestionIndex];

  // --- Event Handlers ---
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: optionIndex });
  };
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  // --- Scoring Logic ---
  const handleConfirmSubmit = () => {
    let score = 0;
    processedQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.newCorrectAnswerIndex) score += 1;
    });
    setFinalScore(score);
    setShowScore(true);
    setIsConfirming(false);
    setTimeout(() => onComplete(score), 3000);
  };

  // --- Custom Styles for Gamification ---
  const gamifiedStyles = `
    /* Disable scroll completely */
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: 100%;
    }

    .gamified-cursor {
      /* New "3D" Animated Cursor */
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="translate(16,16)"><circle r="14" fill="none" stroke="rgba(0,255,135,0.5)" stroke-width="1.5"><animate attributeName="stroke-dasharray" values="0 88; 88 0; 0 88" dur="2s" repeatCount="indefinite" /></circle><circle r="10" fill="none" stroke="rgba(0,255,135,0.7)" stroke-width="1.5"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.5s" repeatCount="indefinite" /></circle><circle r="2" fill="rgba(0,255,135,1)"><animate attributeName="r" from="2" to="4" to="2" dur="1s" repeatCount="indefinite" /></circle></g></svg>') 16 16, auto;
    }
    @keyframes card-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-card-fade-in {
      animation: card-fade-in 0.5s ease-out forwards;
    }
    @keyframes option-pop-in {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-option-pop-in {
      animation: option-pop-in 0.4s ease-out forwards;
    }
  `;

  if (showScore) {
    return <ScoreBanner title="Round 1 Complete!" score={finalScore} totalMarks={questions.length} message="Preparing for the next challenge..." />;
  }

  return (
    <>
      <style>{gamifiedStyles}</style>
      {/* Background Layer */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover"
    src="/l1bg.mp4"
  />
  <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
</div>


      {/* Content Layer with Custom Cursor */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-4 gamified-cursor">
        <ConfirmationModal 
            isOpen={isConfirming} 
            title="Submit Answers?" 
            message="This action is final and cannot be undone." 
            onConfirm={handleConfirmSubmit} 
            onCancel={() => setIsConfirming(false)} 
        />
        {/* Main Content Wrapper */}
        <div className="w-full max-w-4xl flex flex-col">
            <h1 className="text-3xl font-bold text-center mb-6 text-green-400 animate-card-fade-in">{roundTitle}</h1>
            
            <div key={currentQuestionIndex} className="bg-black bg-opacity-40 backdrop-blur-md rounded-lg p-8 shadow-2xl border border-gray-700 flex flex-col animate-card-fade-in">
              <p className="text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <h2 className="text-2xl font-semibold mb-6 min-h-[6rem]">{currentQuestion.question}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.shuffledOptions.map((option, index) => (
                  <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`text-left p-4 rounded-lg transition duration-200 border-2 animate-option-pop-in transform hover:scale-105 hover:border-green-400 hover:shadow-lg hover:bg-green-900/50 ${
                        selectedAnswers[currentQuestion.id] === index
                          ? 'bg-green-600 border-green-400 shadow-lg'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                  >
                      <span className="font-mono mr-3 text-green-400">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                  </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 p-4 bg-black bg-opacity-40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 animate-card-fade-in">
              <button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                  Previous
              </button>
              <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
              {currentQuestionIndex < questions.length - 1 ? (
                  <button onClick={goToNextQuestion} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-6 rounded-lg transition">
                  Next
                  </button>
              ) : (
                  <button onClick={() => setIsConfirming(true)} className="bg-red-600 hover:bg-red-700 font-bold py-2 px-6 rounded-lg transition animate-pulse">
                  Submit Round 1
                  </button>
              )}
            </div>
        </div>
      </div>
    </>
  );
};

export default MCQRound;
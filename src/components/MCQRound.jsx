import React, { useState, useEffect, useMemo } from 'react';
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
  // useMemo ensures that the questions and options are shuffled only once
  // when the component first receives the questions prop.
  const processedQuestions = useMemo(() => {
    return questions.map(q => {
      // Get the original correct answer text before shuffling the options
      const correctAnswerText = q.options[q.correctAnswerIndex];
      // Create a new shuffled array of the options
      const shuffledOptions = shuffleArray(q.options);
      // Find the new index of the correct answer within the shuffled array
      const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
      
      // Return a new question object with the shuffled data
      return {
        ...q,
        shuffledOptions: shuffledOptions,
        newCorrectAnswerIndex: newCorrectIndex,
      };
    });
  }, [questions]);

  const currentQuestion = processedQuestions[currentQuestionIndex];

  // --- Event Handlers ---
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // --- Scoring Logic for Jumbled Options ---
  const handleConfirmSubmit = () => {
    let score = 0;
    processedQuestions.forEach(q => {
      const userAnswerIndex = selectedAnswers[q.id];
      // Check if the user's selected answer index matches the new correct index
      if (userAnswerIndex !== undefined && userAnswerIndex === q.newCorrectAnswerIndex) {
        score += 1;
      }
    });
    setFinalScore(score);
    setShowScore(true);
    setIsConfirming(false);
    // Delay calling onComplete to allow the user to see their score
    setTimeout(() => {
      onComplete(score);
    }, 3000);
  };

  if (showScore) {
    return <ScoreBanner title="Round 1 Complete!" score={finalScore} totalMarks={questions.length} message="Preparing for the next challenge..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-24 flex flex-col items-center">
      <ConfirmationModal 
        isOpen={isConfirming} 
        title="Submit Answers?" 
        message="Are you sure you want to submit your answers for this round? This action cannot be undone." 
        onConfirm={handleConfirmSubmit} 
        onCancel={() => setIsConfirming(false)} 
      />
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-400">{roundTitle}</h1>
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
          <p className="text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.shuffledOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`text-left p-4 rounded-lg transition duration-200 border-2 ${
                  selectedAnswers[currentQuestion.id] === index
                    ? 'bg-green-600 border-green-400 shadow-lg'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <span className="font-mono mr-3 text-green-400">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 p-4 bg-gray-800 rounded-lg shadow-lg">
          <button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
            Previous
          </button>
          <span className="font-semibold">{currentQuestionIndex + 1} of {questions.length}</span>
          {currentQuestionIndex < questions.length - 1 ? (
            <button onClick={goToNextQuestion} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
              Next
            </button>
          ) : (
            <button onClick={() => setIsConfirming(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition animate-pulse">
              Submit Round 1
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQRound;


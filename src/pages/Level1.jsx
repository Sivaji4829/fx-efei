import React, { useState, useEffect } from 'react';
import allQuestions from '../data/mcq-data.json';
import MCQRound from '../components/MCQRound';

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const Level1 = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);

  // This useEffect hook runs once when the component mounts.
  // It shuffles and selects the questions for the round.
  useEffect(() => {
    // 1. Create a shuffled copy of all available questions.
    const shuffledQuestions = shuffleArray([...allQuestions]);
    
    // 2. Select the first 30 questions from the shuffled list.
    const selectedQuestions = shuffledQuestions.slice(0, 30);
    
    setQuestions(selectedQuestions);
  }, []); // The empty dependency array ensures this runs only once.

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen"><p>Loading questions...</p></div>;
  }

  return (
    <MCQRound
      questions={questions}
      onComplete={onComplete}
      roundTitle="Round 1: Multiple Choice Mayhem"
    />
  );
};

export default Level1;

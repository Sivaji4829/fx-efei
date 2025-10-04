import React, { useState, useEffect } from 'react';
import allQuestions from '../data/coding-data1.json'; // Correctly imports from your new data file
import CodingChallenge from '../components/CodingChallenge';

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

const Level3 = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // 1. Filter all questions designated for Round 3 from the new data file.
    const round3Questions = allQuestions.filter(q => q.round === 3);
    
    // 2. Shuffle the filtered questions randomly.
    const shuffledQuestions = shuffleArray(round3Questions);
    
    // 3. Select the first 3 questions from the shuffled list for the final challenge.
    const selectedQuestions = shuffledQuestions.slice(0, 3);
    
    setQuestions(selectedQuestions);
  }, []); // The empty dependency array ensures this runs only once.

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-green-400 animate-pulse">Loading Final Challenge...</p>
      </div>
    );
  }

  return (
    <CodingChallenge
      questions={questions}
      onComplete={onComplete}
      roundTitle="Round 3: The Final Coding Challenge"
      totalMarks={30} // 3 questions * 10 marks each
    />
  );
};

export default Level3;
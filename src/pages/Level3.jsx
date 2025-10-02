import React, { useState, useEffect } from 'react';
import allQuestions from '../data/coding-data.json';
import SnippetSolvingRound from '../components/SnippetSolvingRound'; // Use the new component

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
    const round3Questions = allQuestions.filter(q => q.round === 3);
    const shuffledQuestions = shuffleArray(round3Questions);
    const selectedQuestions = shuffledQuestions.slice(0, 3);
    setQuestions(selectedQuestions);
  }, []);

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen"><p>Loading final challenge...</p></div>;
  }

  return (
    <SnippetSolvingRound
      questions={questions}
      onComplete={onComplete}
      roundTitle="Round 3: Final Challenge"
      totalMarks={30}
    />
  );
};

export default Level3;


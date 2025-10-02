import React, { useState, useEffect } from 'react';
import allQuestions from '../data/coding-data.json';
import SnippetSolvingRound from '../components/SnippetSolvingRound';

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

const Level2 = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Filter all questions designated for Round 2 from the data file.
    const round2Questions = allQuestions.filter(q => q.round === 2);
    
    // Shuffle the filtered questions randomly.
    const shuffledQuestions = shuffleArray(round2Questions);
    
    // Select the first 5 questions from the shuffled list to be used in the test.
    const selectedQuestions = shuffledQuestions.slice(0, 5);
    
    setQuestions(selectedQuestions);
  }, []); // The empty dependency array ensures this runs only once.

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen"><p>Loading questions...</p></div>;
  }

  return (
    <SnippetSolvingRound
      questions={questions}
      onComplete={onComplete}
      roundTitle="Round 2: Snippet Debugging"
      totalMarks={20}
      showLanguageSelector={false} // Set to false to hide the language selector
    />
  );
};

export default Level2;
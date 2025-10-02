import React from 'react';
import MCQRound from '../components/MCQRound';
import mcqData from '../data/mcq-data.json';

const Level1 = ({ onComplete }) => {
  return (
    <div>
      <MCQRound questions={mcqData} onComplete={onComplete} />
    </div>
  );
};

export default Level1;

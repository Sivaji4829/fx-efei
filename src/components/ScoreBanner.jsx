import React from 'react';

const ScoreBanner = ({ title, score, totalMarks, message }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-green-500/50">
        <h1 className="text-4xl font-bold text-green-400 mb-4">{title}</h1>
        <div className="bg-gray-700 rounded-lg p-6 my-6">
          <p className="text-gray-400 text-lg">Your Score for this Round</p>
          <p className="text-7xl font-bold my-2 text-white">
            {score} <span className="text-4xl text-gray-500">/ {totalMarks}</span>
          </p>
        </div>
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default ScoreBanner;
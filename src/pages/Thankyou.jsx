import React from 'react';

const Thankyou = ({ scores }) => {
  const totalScore = scores.level1 + scores.level2 + scores.level3;
  const totalPossible = 30 + 20 + 30;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gradient-to-b from-gray-900 to-green-900">
      <div className="bg-gray-800 p-12 rounded-2xl shadow-2xl max-w-2xl transform transition-all duration-500 hover:scale-105">
        <h1 className="text-5xl font-bold text-green-400 mb-4">Congratulations!</h1>
        <p className="text-xl text-gray-200 mb-8">You have successfully escaped the Error Island.</p>
        
        <div className="bg-gray-700 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">Your Final Score</h2>
            <p className="text-7xl font-bold text-white">
                {totalScore}
                <span className="text-3xl text-gray-400"> / {totalPossible}</span>
            </p>
        </div>

        <div className="text-left space-y-2 text-lg">
            <p className="flex justify-between">
                <span className="text-gray-400">Round 1 (MCQs):</span> 
                <span className="font-semibold text-green-300">{scores.level1} / 30</span>
            </p>
            <p className="flex justify-between">
                <span className="text-gray-400">Round 2 (Debugging):</span> 
                <span className="font-semibold text-green-300">{scores.level2} / 20</span>
            </p>
            <p className="flex justify-between">
                <span className="text-gray-400">Round 3 (Final Challenge):</span> 
                <span className="font-semibold text-green-300">{scores.level3} / 30</span>
            </p>
        </div>

        <p className="text-gray-400 mt-10 text-md">
          Thank you for participating in FutureX 2025. We will be in touch with you shortly regarding the results.
        </p>
      </div>
    </div>
  );
};

export default Thankyou;

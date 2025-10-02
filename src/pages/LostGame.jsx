import React from 'react';

const LostGame = ({ scores }) => {
  const totalScore = (scores.level1 || 0) + (scores.level2 || 0);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/lp.mp4"
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 p-10 bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl backdrop-blur-md border border-red-500/50 w-full max-w-2xl text-center">
        <h1 className="text-5xl font-mono tracking-widest uppercase font-bold mb-4 text-red-500">
          Mission Failed
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Unfortunately, you did not score enough to proceed to the final round.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 my-6 border border-gray-700">
          <h2 className="text-3xl font-bold text-yellow-300 mb-4">Your Final Score</h2>
          <p className="text-6xl font-mono font-bold text-white mb-6">
            {totalScore} <span className="text-4xl text-gray-400">/ 50</span>
          </p>
          <div className="text-left max-w-sm mx-auto space-y-2 text-lg">
            <div className="flex justify-between">
              <span className="text-gray-400">Round 1 (MCQs):</span>
              <span className="font-semibold">{scores.level1 || 0} / 30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Round 2 (Debugging):</span>
              <span className="font-semibold">{scores.level2 || 0} / 20</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-400 mt-8">
          Thank you for your attempt. Better luck next time!
        </p>
        <p className="text-gray-500 mt-4 text-sm">You may now close this browser window.</p>
      </div>
    </div>
  );
};

export default LostGame;

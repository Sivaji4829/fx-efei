import React from 'react';

const FullscreenVideo = ({ videoSrc, buttonText, onButtonClick }) => {
  return (
    <div className="fixed inset-0 w-full h-full z-50">
      {/* The video element acts as the background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline // Important for mobile browsers
      >
        Your browser does not support the video tag.
      </video>
      
      {/* A semi-transparent overlay to make text more readable */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Content centered on top of the video */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="text-center animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 drop-shadow-lg">
            The Next Challenge Awaits
          </h1>
          <button
            onClick={onButtonClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-110 shadow-lg"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenVideo;

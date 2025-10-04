import React, { useState } from 'react';

// --- ADMIN CONFIGURATION ---
// These are special codes that can bypass the termination lock.
const ADMIN_RESUME_CODES = ["DFX-CIT-100", "DFX-CIT-202", "DFX-CIT-2025"];

const Terminated = ({ reason }) => {
  const [resumeCode, setResumeCode] = useState('');
  const [error, setError] = useState('');

  const handleResumeAttempt = (e) => {
    e.preventDefault();
    if (ADMIN_RESUME_CODES.includes(resumeCode)) {
      // --- DEFINITIVE FIX ---
      // This removes the correct key from localStorage that the App.jsx component checks for.
      localStorage.removeItem('terminationInfo_escapeIsland');
      
      // Reload the application. It will now default to the login screen.
      window.location.reload();
    } else {
      setError('Invalid resume code. Please try again.');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/tr.mp4" // Using the same thematic video
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay for better text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 z-10"></div>
      
      {/* Termination Content */}
<div className="relative z-20 p-10 bg-transparent bg-opacity-50 rounded-3xl shadow-2xl border-4 border-red-600  w-full max-w-2xl text-center ">
  {/* Big Danger Emoji */}
  <div className="text-8xl mb-4">🚫</div>

  {/* Heading */}
  <h1 className="text-5xl font-mono tracking-widest uppercase font-extrabold mb-6 text-red-500 drop-shadow-lg ">
    Test Terminated
  </h1>

  {/* Reason Box */}
  <div className="bg-gray-900 bg-opacity-70 rounded-xl p-6 my-6 border-2 border-gray-700 text-left shadow-inner ">
    <h2 className="text-2xl font-bold text-yellow-400 mb-3">Reason for Termination:</h2>
    <p className="text-lg text-gray-200">{reason || 'A rule violation was detected.'}</p>
  </div>

  {/* Info Text */}
  <p className="text-gray-150 mt-5">Your session has been ended, and your UID has been recorded. You cannot restart the test. Please contact the event organizers if you believe this was in error.</p>
  <p className="text-gray-100 mt-2 text-sm">You may now close this browser window.</p>

  {/* Admin Resume Section */}
  <div className="mt-8 pt-6 border-t border-gray-700 animate-fadeIn">
    <p className="text-sm text-yellow-400 mb-4">For event staff only:</p>
    <form onSubmit={handleResumeAttempt} className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <input
        type="password"
        value={resumeCode}
        onChange={(e) => setResumeCode(e.target.value)}
        placeholder="Enter Resume Code"
        className="px-4 py-2 bg-gray-800 bg-opacity-70 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-300"
      />
      <button
        type="submit"
        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out "
      >
        Resume Session
      </button>
    </form>
 

          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Terminated;


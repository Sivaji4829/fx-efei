import React from 'react';

const LanguageSelector = ({ selectedLanguage, onSelect }) => {
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'cpp', name: 'C++' },
  ];

  return (
    <div className="my-4">
      <p className="text-gray-400 mb-2">Choose your language (Only JS is auto-evaluated):</p>
      <div className="flex gap-2">
        {languages.map(lang => (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedLanguage === lang.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;

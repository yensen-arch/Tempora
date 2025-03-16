import React, { useState, useEffect } from 'react';

const CustomLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const motivationalQuotes = [
    "Your story is waiting to be told...",
    "Your memories deserve to last forever...",
    "Just a little more before you get to create your beautiful story...",
    "Every moment captured is a treasure preserved...",
    "The journey of a thousand memories begins with a single photo..."
  ];

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Rotate through quotes
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        (prevIndex + 1) % motivationalQuotes.length
      );
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <img
            src="https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684526/samples/animals/three-dogs.jpg"
            alt="Three dogs"
            className="w-full h-full object-cover"
          />
          
          {/* Quote Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-white text-xl font-semibold italic transition-opacity duration-500">
                {motivationalQuotes[currentQuoteIndex]}
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Bar Container */}
        <div className="p-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Loading your experience</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            Preparing your memories... Please wait
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomLoader;
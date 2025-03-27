'use client'
import React, { useState, useEffect } from "react";

interface LoaderProps {
  progress: number;
}

const CustomLoader: React.FC<LoaderProps> = ({ progress }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  const motivationalQuotes = [
    "Your story is waiting to be told...",
    "Your memories deserve to last forever...",
    "Just a little more before you get to create your beautiful story...",
    "Every moment captured is a treasure preserved...",
    "The journey of a thousand memories begins with a single photo...",
  ];

  useEffect(() => {
    // Quote rotation logic
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 3000);

    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    // Progress counter logic
    if (progress === 40 || progress === 90) {
      let startTime = Date.now();
      const counterDuration = 20000; // 20 seconds
      let animationFrameId: number;

      const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const percentage = Math.min(elapsedTime / counterDuration, 1);
        
        let adjustedProgress: number;
        if (progress === 40) {
          // From 0 to 40
          adjustedProgress = percentage * 40;
        } else {
          // From 40 to 90
          adjustedProgress = 40 + (percentage * 50);
        }

        setDisplayProgress(Math.round(adjustedProgress));

        if (percentage < 1) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      };

      animationFrameId = requestAnimationFrame(updateProgress);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } else if (progress === 100) {
      setDisplayProgress(100);
    } else if (progress > displayProgress) {
      // Ensure progress can continue beyond the counters
      setDisplayProgress(progress);
    }
  }, [progress]);

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
            <span className="text-sm font-medium text-gray-700">
              Loading your experience
            </span>
            <span className="text-sm font-medium text-gray-700">
              {displayProgress}%
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center">
            {progress === 100 
              ? "Your memories are ready!" 
              : "Preparing your memories... Please wait"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomLoader;
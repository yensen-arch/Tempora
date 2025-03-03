import React, { useEffect, useRef } from "react";
import { Edit } from "./types";
import { motion } from "framer-motion";

interface TimelineSliderProps {
  visibleStart: number;
  visibleEnd: number;
  zoom: number;
  editHistory: Edit[];
  setVisibleStart: (start: number) => void;
  setVisibleEnd: (end: number) => void;
  duration: number;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  visibleStart,
  visibleEnd,
  zoom,
  editHistory,
  setVisibleStart,
  setVisibleEnd,
  duration,
}) => {
  const visibleDuration = visibleEnd - visibleStart;
  
  const interval = visibleDuration / 19;
  
  const currentTrim = editHistory.filter(edit => edit.type === "trim").pop() || {
    start: 0,
    end: duration
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handlePan = (direction: 'left' | 'right') => {
    const panAmount = visibleDuration * 0.2;
    
    if (direction === 'left') {
      const newStart = Math.max(currentTrim.start, visibleStart - panAmount);
      const newEnd = newStart + visibleDuration;
      setVisibleStart(newStart);
      setVisibleEnd(newEnd);
    } else {
      const newEnd = Math.min(currentTrim.end, visibleEnd + panAmount);
      const newStart = newEnd - visibleDuration;
      setVisibleStart(newStart);
      setVisibleEnd(newEnd);
    }
  };
  
  const markers = Array.from({ length: 20 }, (_, i) => {
    const time = visibleStart + (i * interval);
    
    let displayTime = time;
    const orderedSplices = editHistory
      .filter((edit) => edit.type === "splice")
      .sort((a, b) => a.start - b.start);

    for (const splice of orderedSplices) {
      const spliceLength = splice.end - splice.start;
      if (displayTime >= splice.start) {
        displayTime += spliceLength;
      }
    }

    const position = (i / 19) * 100;
    
    return (
      <div
        key={i}
        className="absolute top-0 h-8"
        style={{
          left: `${position}%`,
        }}
      >
        <div className="h-full w-px bg-black" />
        <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
          {visibleDuration < 20 ? displayTime.toFixed(1) : Math.round(displayTime)}s
        </div>
      </div>
    );
  });

  const showPanControls = zoom > 1 && (visibleStart > currentTrim.start || visibleEnd < currentTrim.end);
  
  const canPanLeft = visibleStart > currentTrim.start;
  const canPanRight = visibleEnd < currentTrim.end;

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full relative">
        {markers}
      </div>

      {/* Timeline range indicator showing visible range */}
      {/* <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 mt-6">
        <span>{formatTime(visibleStart)}</span>
        <span>{formatTime(visibleEnd)}</span>
      </div> */}
      
      {/* Pan controls */}
      {showPanControls && (
        <>
          {canPanLeft && (
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 bg-gray-200 hover:bg-gray-300 rounded-full p-1 z-10"
              onClick={() => handlePan('left')}
              aria-label="Pan left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {canPanRight && (
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8 bg-gray-200 hover:bg-gray-300 rounded-full p-1 z-10"
              onClick={() => handlePan('right')}
              aria-label="Pan right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TimelineSlider;
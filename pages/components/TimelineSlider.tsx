import React from "react";
import { Edit } from "./types";

interface TimelineSliderProps {
  visibleStart: number;
  visibleEnd: number;
  zoom: number;
  editHistory: Edit[];
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  visibleStart,
  visibleEnd,
  zoom,
  editHistory,
}) => {
  // Calculate the visible duration
  const visibleDuration = visibleEnd - visibleStart;
  
  // Calculate the interval between each of the 20 markers
  const interval = visibleDuration / 19; // 19 intervals for 20 markers
  
  // Format time for display with the new requirements
  const formatTimeLabel = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    // If exactly at a minute marker, show "X(minute finished)"
    if (seconds === 0 && minutes > 0) {
      return `${minutes}(minute finished)`;
    }
    
    // For all other cases, just show the seconds
    return `${seconds}`;
  };
  
  // Generate exactly 20 markers
  const markers = Array.from({ length: 20 }, (_, i) => {
    const time = visibleStart + (i * interval);
    
    // Get actual video time by accounting for all previous splices
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

    // Calculate position percentage within the visible window
    const position = (i / 19) * 100; // Evenly distributed positions
    
    // Determine marker style - make minute markers taller
    const isMinuteMarker = Math.round(displayTime) % 60 === 0 && Math.floor(displayTime / 60) > 0;
    const markerHeight = isMinuteMarker ? "h-10" : "h-8";
    const textClass = isMinuteMarker ? "font-medium text-black" : "text-gray-500";
    
    return (
      <div
        key={i}
        className={`absolute top-0 ${markerHeight}`}
        style={{
          left: `${position}%`,
        }}
      >
        <div className="h-full w-px bg-black" />
        <div className={`absolute top-full transform -translate-x-1/2 text-xs ${textClass} mt-1`}>
          {formatTimeLabel(displayTime)}
        </div>
      </div>
    );
  });

  return <>{markers}</>;
};

export default TimelineSlider;
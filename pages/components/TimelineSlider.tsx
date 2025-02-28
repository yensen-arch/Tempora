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

  return <>{markers}</>;
};

export default TimelineSlider;
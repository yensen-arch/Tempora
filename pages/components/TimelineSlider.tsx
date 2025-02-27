// TimelineSlider.tsx
import React from 'react';
import { Edit } from './types';

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
  editHistory
}) => {
  return (
    <>
      {Array.from({
        length: Math.ceil((visibleEnd - visibleStart) / zoom) + 1,
      }).map((_, i) => {
        const time = visibleStart + i * zoom;
        if (time > visibleEnd) return null;

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

        return (
          <div
            key={i}
            className="absolute top-0 h-8"
            style={{
              left: `${
                ((time - visibleStart) / (visibleEnd - visibleStart)) * 100
              }%`,
            }}
          >
            <div className="h-full w-px bg-black" />
            <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
              {displayTime.toFixed(1)}s
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TimelineSlider;
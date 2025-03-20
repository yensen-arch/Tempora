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
    const seconds = Math.floor(timeInSeconds % 60);
    // For all other cases, just show the seconds
    return `${seconds}`;
  };

  const generateBoldMinuteMarkers = () => {
    const markers = [];
    const startMinute = Math.ceil(visibleStart / 60);
    const endMinute = Math.floor(visibleEnd / 60);

    for (let min = startMinute; min <= endMinute; min++) {
      const timeInSeconds = min * 60;

      if ((timeInSeconds - visibleStart) % interval === 0) {
        continue;
      }
      let displayTime = timeInSeconds;
      const orderedSplices = editHistory
        .filter((edit) => edit.type === "splice")
        .sort((a, b) => a.start - b.start);

      for (const splice of orderedSplices) {
        const spliceLength = splice.end - splice.start;
        if (displayTime >= splice.start) {
          displayTime += spliceLength;
        }
      }

      const position = ((timeInSeconds - visibleStart) / visibleDuration) * 100;

      if (position >= 0 && position <= 100) {
        markers.push(
          <div
            key={`minute-${min}`}
            className="absolute top-0 h-12"
            style={{
              left: `${position}%`,
            }}
          >
            <div className="h-full w-[1.5px] bg-black" />
            <div className="absolute top-full transform -translate-x-1/2 text-sm font-bold text-black mt-1">
              {min}:00
            </div>
          </div>
        );
      }
    }

    return markers;
  };

  // Generate exactly 20 markers
  const markers = Array.from({ length: 20 }, (_, i) => {
    const time = visibleStart + i * interval;

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
    const isMinuteMarker =
      Math.round(displayTime) % 60 === 0 && Math.floor(displayTime / 60) > 0;
    const markerHeight = isMinuteMarker ? "h-10" : "h-8";
    const textClass = isMinuteMarker
      ? "font-medium text-black"
      : "text-gray-500";

    return (
      <div
        key={i}
        className={`absolute top-0 ${markerHeight}`}
        style={{
          left: `${position}%`,
        }}
      >
        <div className="h-full w-px bg-black" />
        <div
          className={`absolute top-full transform -translate-x-1/2 text-xs ${textClass} mt-1`}
        >
          {formatTimeLabel(displayTime)}
        </div>
      </div>
    );
  });

  return (
    <>
      {markers}
      {generateBoldMinuteMarkers()}
    </>
  );
};

export default TimelineSlider;

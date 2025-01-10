import React, { useRef, useState, useEffect } from "react";

interface TimelineProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (timelineRef.current) {
      const updateDimensions = () => {
        const rect = timelineRef.current?.getBoundingClientRect();
        if (rect) {
          setDimensions({
            width: rect.width,
            left: rect.left,
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  const calculateTime = (position: number) => {
    return Math.round((position / dimensions.width) * duration);
  };

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!dimensions.width) return;

    const clickX = event.clientX - dimensions.left;
    const clickedTime = calculateTime(clickX);

    // Determine whether to adjust the start or end time
    const midPoint = (startTime + endTime) / 2;
    if (clickedTime < midPoint) {
      onStartTimeChange(Math.max(0, Math.min(clickedTime, endTime - 1)));
    } else {
      onEndTimeChange(Math.min(duration, Math.max(clickedTime, startTime + 1)));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="relative w-full h-20 bg-gray-100 rounded-lg overflow-hidden"
      ref={timelineRef}
      onClick={handleTimelineClick} // Handle timeline click
    >
      {/* Timeline track */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-200 mt-2" />

      {/* Highlighted portion */}
      <div
        className="absolute top-0 h-8 bg-indigo-200 mt-2"
        style={{
          left: `${(startTime / duration) * 100}%`,
          width: `${((endTime - startTime) / duration) * 100}%`,
        }}
      />

      {/* Time labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs text-gray-600">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Timeline;

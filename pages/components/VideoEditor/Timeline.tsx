import React, { useRef, useState, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";

interface TimelineProps {
  duration: number; // Total video duration in seconds
  startTime: number; // Current start time in seconds
  endTime: number; // Current end time in seconds
  onStartTimeChange: (time: number) => void; // Callback for updating start time
  onEndTimeChange: (time: number) => void; // Callback for updating end time
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isTimelineReady, setIsTimelineReady] = useState(false);

  useEffect(() => {
    if (timelineRef.current) {
      setIsTimelineReady(true);
    }
  }, [timelineRef]);

  const handleDrag = (info: PanInfo, type: "start" | "end") => {
    if (timelineRef.current) {
      const timelineWidth = timelineRef.current.offsetWidth;
      const timelineLeft = timelineRef.current.getBoundingClientRect().left;

      // Get the new position in pixels and calculate time as a percentage of duration
      const newPosition = Math.max(
        0,
        Math.min(info.point.x - timelineLeft, timelineWidth)
      );
      const newTime = (newPosition / timelineWidth) * duration;

      if (type === "start") {
        onStartTimeChange(Math.min(newTime, endTime - 1)); // Prevent overlapping with endTime
      } else {
        onEndTimeChange(Math.max(newTime, startTime + 1)); // Prevent overlapping with startTime
      }
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
      className="relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden"
      ref={timelineRef}
    >
      {/* Highlighted portion */}
      <div
        className="absolute top-0 left-0 h-8 bg-blue-500 opacity-50 mt-2"
        style={{
          left: `${(startTime / duration) * 100}%`,
          width: `${((endTime - startTime) / duration) * 100}%`,
        }}
      />

      {isTimelineReady && (
        <>
          {/* Start time point */}
          <motion.div
            className="absolute w-6 h-6 bg-blue-600 rounded-full cursor-pointer"
            style={{
              left: `${(startTime / duration) * 100}%`,
              top: "6px",
              transform: "translateX(-50%)",
            }}
            drag="x"
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
              left: 0, // Start slider can't go before the timeline start
              right: (endTime / duration) * (timelineRef.current?.offsetWidth || 0), // Can't go beyond the end slider
            }}
            onDrag={(_, info) => handleDrag(info, "start")}
          >
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-600 text-white text-xs px-1 rounded">
              {formatTime(startTime)}
            </div>
          </motion.div>

          {/* End time point */}
          <motion.div
            className="absolute w-6 h-6 bg-blue-600 rounded-full cursor-pointer"
            style={{
              left: `${(endTime / duration) * 100}%`,
              top: "6px",
              transform: "translateX(-50%)",
            }}
            drag="x"
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
              left: (startTime / duration) * (timelineRef.current?.offsetWidth || 0), // Can't go before the start slider
              right: (timelineRef.current?.offsetWidth || 0), // Can't go beyond the timeline end
            }}
            onDrag={(_, info) => handleDrag(info, "end")}
          >
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-600 text-white text-xs px-1 rounded">
              {formatTime(endTime)}
            </div>
          </motion.div>
        </>
      )}

      {/* Time labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs text-gray-600">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Timeline;

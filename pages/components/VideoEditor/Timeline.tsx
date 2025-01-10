import React, { useRef } from "react";
import { motion, PanInfo } from "framer-motion";

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

  const handleDrag = (
    info: PanInfo,
    type: "start" | "end"
  ) => {
    if (timelineRef.current) {
      const timelineWidth = timelineRef.current.offsetWidth;
      const newPosition = info.point.x - timelineRef.current.getBoundingClientRect().left;
      const newTime = Math.max(
        0,
        Math.min((newPosition / timelineWidth) * duration, duration)
      );

      if (type === "start") {
        onStartTimeChange(Math.min(newTime, endTime - 1));
      } else {
        onEndTimeChange(Math.max(newTime, startTime + 1));
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
    <div className="relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden" ref={timelineRef}>
      {/* Highlighted portion */}
      <div
        className="absolute top-0 left-0 h-8 bg-blue-500 opacity-50 mt-2"
        style={{
          left: `${(startTime / duration) * 100}%`,
          width: `${((endTime - startTime) / duration) * 100}%`,
        }}
      />

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
        onDrag={(_, info) => handleDrag(info, "end")}
      >
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-600 text-white text-xs px-1 rounded">
          {formatTime(endTime)}
        </div>
      </motion.div>

      {/* Time labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs text-gray-600">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Timeline;

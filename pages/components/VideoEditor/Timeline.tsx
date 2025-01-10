import React, { useState, useEffect, useRef } from "react";
import { motion, PanInfo } from "framer-motion";

interface TimelineProps {
  duration: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  videoRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleDrag = (info: PanInfo, type: "start" | "end") => {
    if (timelineRef.current) {
      const timelineWidth = timelineRef.current.offsetWidth;
      const boundingRect = timelineRef.current.getBoundingClientRect();
      const relativePosition = (info.point.x - boundingRect.left) / timelineWidth;
      const newTime = Math.max(0, Math.min(duration * relativePosition, duration));

      if (type === "start") {
        onStartTimeChange(Math.min(newTime, endTime - 1));
        if (videoRef.current) videoRef.current.currentTime = newTime; // Sync preview
      } else {
        onEndTimeChange(Math.max(newTime, startTime + 1));
        if (videoRef.current) videoRef.current.currentTime = newTime; // Sync preview
      }
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full h-20 bg-gray-200 rounded-lg overflow-hidden" ref={timelineRef}>
      {/* Progress bar background */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-300 mt-2"></div>

      {/* Highlighted area */}
      <div
        className="absolute top-0 left-0 h-8 bg-blue-500 opacity-50 mt-2"
        style={{
          left: `${(startTime / duration) * 100}%`,
          width: `${((endTime - startTime) / duration) * 100}%`,
        }}
      />

      {/* Start time slider */}
      <motion.div
        className="absolute top-0 w-4 h-12 bg-blue-600 rounded-t-full cursor-ew-resize -ml-2"
        style={{ left: `${(startTime / duration) * 100}%`, top: "8px" }}
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={timelineRef}
        onDrag={(_, info) => handleDrag(info, "start")}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-blue-600 text-white text-xs px-1 rounded">
          {formatTime(startTime)}
        </div>
      </motion.div>

      {/* End time slider */}
      <motion.div
        className="absolute top-0 w-4 h-12 bg-blue-600 rounded-t-full cursor-ew-resize -mr-2"
        style={{ left: `${(endTime / duration) * 100}%`, top: "8px" }}
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={timelineRef}
        onDrag={(_, info) => handleDrag(info, "end")}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
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

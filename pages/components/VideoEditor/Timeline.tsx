'use client';

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
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          left: rect.left,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const calculateTime = (position: number) => {
    return Math.round((position / dimensions.width) * duration);
  };

  const handleMove = (clientX: number) => {
    if (!dragging || dimensions.width === 0) return;

    const positionX = clientX - dimensions.left;
    const time = Math.max(0, Math.min(calculateTime(positionX), duration));

    if (dragging === "start") {
      onStartTimeChange(Math.min(time, endTime - 1));
    } else if (dragging === "end") {
      onEndTimeChange(Math.max(time, startTime + 1));
    }
  };

  const handleMouseMove = (event: MouseEvent) => handleMove(event.clientX);
  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault(); // Prevents scrolling during touch drag
    handleMove(event.touches[0].clientX);
  };

  const handleEnd = () => {
    setDragging(null);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleEnd);
  };

  const handleStart = (handle: "start" | "end") => {
    setDragging(handle);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
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
      className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden"
      ref={timelineRef}
    >
      {/* Timeline track */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gray-200 mt-2" />

      {/* Highlighted portion */}
      <div
        className="absolute top-0 h-12 bg-indigo-200 mt-2"
        style={{
          left: `${(startTime / duration) * 100}%`,
          width: `${((endTime - startTime) / duration) * 100}%`,
        }}
      />

      {/* Start handle */}
      <div
        className="absolute top-0 w-6 h-12 bg-indigo-500 rounded-full cursor-ew-resize mt-2 flex items-center justify-center"
        style={{
          left: `${(startTime / duration) * 100}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={() => handleStart("start")}
        onTouchStart={() => handleStart("start")}
      >
        <div className="w-1 h-6 bg-white rounded-full" />
      </div>

      {/* End handle */}
      <div
        className="absolute top-0 w-6 h-12 bg-indigo-500 rounded-full cursor-ew-resize mt-2 flex items-center justify-center"
        style={{
          left: `${(endTime / duration) * 100}%`,
          transform: "translateX(-50%)",
        }}
        onMouseDown={() => handleStart("end")}
        onTouchStart={() => handleStart("end")}
      >
        <div className="w-1 h-6 bg-white rounded-full" />
      </div>

      {/* Time labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-sm text-gray-600">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>
    </div>
  );
};

export default Timeline;

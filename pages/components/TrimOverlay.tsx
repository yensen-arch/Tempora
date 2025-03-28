"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";

interface TrimOverlayProps {
  duration: number;
  onTrimChange: (start: number, end: number) => void;
  onClose: () => void;
  initialStart: number;
  initialEnd: number;
}

const TrimOverlay: React.FC<TrimOverlayProps> = ({
  duration,
  onTrimChange,
  onClose,
  initialStart,
  initialEnd,
}) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(1);

  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null);

  const handleMouseDown = (handle: "left" | "right") => {
    setIsDragging(handle);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById("trim-container");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percentage = x / rect.width;

      if (isDragging === "left") {
        setStart(Math.max(0, Math.min(percentage, end - 0.1)));
      } else {
        setEnd(Math.min(1, Math.max(percentage, start + 0.1)));
      }
    },
    [isDragging, start, end]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleTrimChange = () => {
    onTrimChange(start, end);
    onClose();
  };

  const leftPosition = (start / duration) * 100;
  const rightPosition = 100 - (end / duration) * 100;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
      <div id="trim-container" className="relative w-full h-16 bg-gray-200">
        <div
          className="absolute inset-y-0 bg-blue-500 bg-opacity-50"
          style={{ left: `${leftPosition}%`, right: `${rightPosition}%` }}
        />
        {/* Left Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-blue-500 cursor-ew-resize"
          style={{ left: `${leftPosition}%` }}
          onMouseDown={() => handleMouseDown("left")}
        />
        {/* Right Handle */}
        <div
          className="absolute top-0 bottom-0 w-3 bg-blue-500 cursor-ew-resize"
          style={{ right: `${rightPosition}%` }}
          onMouseDown={() => handleMouseDown("right")}
        />
      </div>
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center space-x-4">
        <button
          onClick={handleTrimChange}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Trim
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrimOverlay;

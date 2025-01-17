"use client";

import React, { useRef, useState, useEffect } from "react";

interface TimelineProps {
  duration: number;
  currentVideoId: string;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
}

interface Selection {
  start: number;
  end: number;
}

const Timeline: React.FC<TimelineProps> = ({ duration, currentVideoId, setDuration }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, left: 0 });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const [videoSelections, setVideoSelections] = useState<
    Record<string, Selection[]>
  >({});
  const [savedSelections, setSavedSelections] = useState<Selection[]>([]);
  const [isTrimmed, setIsTrimmed] = useState(false);

  useEffect(() => {
    setSavedSelections(videoSelections[currentVideoId] || []);
    if (!isTrimmed) {
      setStartTime(0);
      setEndTime(duration);
    }
  }, [currentVideoId, videoSelections, duration, isTrimmed]);

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

  const handleMove = (clientX: number, handle: "start" | "end") => {
    if (dimensions.width === 0) return;

    const positionX = clientX - dimensions.left;
    const time = Math.max(0, Math.min(calculateTime(positionX), duration));

    if (handle === "start") {
      setStartTime(Math.min(time, endTime - 1));
    } else if (handle === "end") {
      setEndTime(Math.max(time, startTime + 1));
    }
  };

  const handleMouseMove = (event: MouseEvent, handle: "start" | "end") => {
    event.preventDefault();
    handleMove(event.clientX, handle);
  };

  const handleTouchMove = (event: TouchEvent, handle: "start" | "end") => {
    event.preventDefault();
    handleMove(event.touches[0].clientX, handle);
  };

  const handleMouseMoveStart = (e: MouseEvent) => handleMouseMove(e, "start");
  const handleMouseMoveEnd = (e: MouseEvent) => handleMouseMove(e, "end");
  const handleTouchMoveStart = (e: TouchEvent) => handleTouchMove(e, "start");
  const handleTouchMoveEnd = (e: TouchEvent) => handleTouchMove(e, "end");

  const handleDragStart = (handle: "start" | "end") => {
    const moveHandler =
      handle === "start" ? handleMouseMoveStart : handleMouseMoveEnd;
    const touchMoveHandler =
      handle === "start" ? handleTouchMoveStart : handleTouchMoveEnd;

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("touchmove", touchMoveHandler, { passive: false });
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);
  };

  const handleDragEnd = () => {
    window.removeEventListener("mousemove", handleMouseMoveStart);
    window.removeEventListener("mousemove", handleMouseMoveEnd);
    window.removeEventListener("touchmove", handleTouchMoveStart);
    window.removeEventListener("touchmove", handleTouchMoveEnd);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchend", handleDragEnd);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSaveSelection = () => {
    const newSelections = [
      ...savedSelections,
      { start: startTime, end: endTime },
    ];

    setSavedSelections(newSelections);
    setVideoSelections((prev) => ({
      ...prev,
      [currentVideoId]: newSelections,
    }));

    setIsTrimmed(true);
    setStartTime(0);
    setEndTime(endTime - startTime);
  };

  const handleTrimVideo = () => {
    if (savedSelections.length > 0) {
      const lastSelection = savedSelections[savedSelections.length - 1];
      setStartTime(0);
      setEndTime(lastSelection.end - lastSelection.start);
      setDuration(lastSelection.end - lastSelection.start);
      setSavedSelections([]);
      setIsTrimmed(true);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className="relative w-full h-28 bg-gray-100 rounded-lg overflow-hidden"
        ref={timelineRef}
      >
        <div className="absolute top-0 left-0 w-full h-12 bg-gray-200 mt-4" />
        {!isTrimmed && savedSelections.map((selection, index) => (
          <div
            key={index}
            className="absolute top-0 h-12 bg-green-500 mt-4"
            style={{
              left: `${(selection.start / duration) * 100}%`,
              width: `${((selection.end - selection.start) / duration) * 100}%`,
              zIndex: 10,
            }}
          />
        ))}

        <div
          className="absolute top-0 h-12 bg-indigo-300 mt-4"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
        />

        <div
          className="absolute top-0 w-6 h-12 bg-indigo-500 rounded-full cursor-ew-resize mt-4 flex items-center justify-center"
          style={{
            left: `${(startTime / duration) * 100}%`,
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart("start");
          }}
          onTouchStart={() => handleDragStart("start")}
        >
          <div className="w-1 h-6 bg-white rounded-full" />
        </div>

        <div
          className="absolute top-0 w-6 h-12 bg-indigo-500 rounded-full cursor-ew-resize mt-4 flex items-center justify-center"
          style={{
            left: `${(endTime / duration) * 100}%`,
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart("end");
          }}
          onTouchStart={() => handleDragStart("end")}
        >
          <div className="w-1 h-6 bg-white rounded-full" />
        </div>

        <div
          className="absolute bottom-0 text-sm text-gray-600"
          style={{
            left: `${(startTime / duration) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          {formatTime(startTime)}
        </div>

        <div
          className="absolute bottom-0 text-sm text-gray-600"
          style={{
            left: `${(endTime / duration) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          {formatTime(endTime)}
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={handleSaveSelection}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Selection
        </button>
        <button
          onClick={handleTrimVideo}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          disabled={savedSelections.length === 0}
        >
          Trim Video
        </button>
      </div>
    </div>
  );
};

export default Timeline;


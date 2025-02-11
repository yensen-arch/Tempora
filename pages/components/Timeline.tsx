"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import TrimOverlay from "./TrimOverlay";

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
}
const Timeline: React.FC<TimelineProps> = ({ videoRef, duration }) => {
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const timelineX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTimeline = () => {
      if (timelineRef.current && !isDragging && containerRef.current) {
        const progress = video.currentTime / video.duration;
        const containerWidth = containerRef.current.offsetWidth;
        // Center the current time at the playhead
        timelineX.set(-(progress * containerWidth * zoom) + containerWidth / 2);
      }
    };

    video.addEventListener("timeupdate", updateTimeline);
    return () => video.removeEventListener("timeupdate", updateTimeline);
  }, [videoRef, zoom, timelineX, isDragging]);

  const handleZoom = (direction) => {
    setZoom((prevZoom) => Math.min(5, Math.max(1, prevZoom + direction * 0.5)));
  };

  const handleDrag = (_, info) => {
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const centerOffset = containerWidth / 2;
      // Calculate time based on distance from center
      const timelinePosition = -timelineX.get() + centerOffset;
      const progress = timelinePosition / (containerWidth * zoom);
      const newTime = progress * videoRef.current.duration;

      if (
        !isNaN(newTime) &&
        isFinite(newTime) &&
        newTime >= 0 &&
        newTime <= videoRef.current.duration
      ) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const [showTrim, setShowTrim] = useState(false);
  const [trimRanges, setTrimRanges] = useState<
    { start: number; end: number }[]
  >([]);
  const handleTrimUpdate = (start: number, end: number) => {
    setTrimRanges([{ start, end }]); // Store trimmed section
  };

  return (
    <div className="relative w-full max-w-3xl mt-4 bg-gray-100 rounded-lg p-8">
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleZoom(-1)}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => handleZoom(1)}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Zoom: {zoom.toFixed(1)}x
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronLeft size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">Drag to navigate</span>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowTrim(true)}
          className="mb-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Precut
        </button>
        <div
          ref={containerRef}
          className="relative w-full h-20 overflow-hidden  border-b border-gray-200  "
        >
          {showTrim && (
            <TrimOverlay
              duration={duration}
              onTrimChange={handleTrimUpdate}
              onClose={() => setShowTrim(false)}
            />
          )}
          {/* Movable timeline */}
          <motion.div
            ref={timelineRef}
            className="absolute top-0 left-0 h-12 p-4"
            style={{
              width: `${zoom * 100}%`,
              x: timelineX,
              display: trimRanges.length ? "none" : "block", // Hide if trim is applied

            }}
            drag="x"
            dragConstraints={{
              left: -(zoom * 100 - 100) + "%",
              right: "0%",
            }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            {/* Time markers */}
            {[...Array(Math.ceil(duration) + 1)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-8"
                style={{ left: `${(i / duration) * 100}%` }}
              >
                <div className="h-full w-px bg-gray-300" />
                <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
                  {i}s
                </div>
              </div>
            ))}
          </motion.div>

          {/* Fixed center playhead */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-red-500 z-10">
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;

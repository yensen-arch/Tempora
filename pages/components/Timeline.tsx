"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

function Timeline({ videoRef, duration }) {
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const backgroundX = useTransform(x, (value) => -value);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTimeline = () => {
      if (timelineRef.current && !isDragging) {
        const progress = (video.currentTime / video.duration) * 100;
        x.set((progress / 100) * (zoom * 100));
      }
    };

    video.addEventListener("timeupdate", updateTimeline);
    return () => video.removeEventListener("timeupdate", updateTimeline);
  }, [videoRef, zoom, x, isDragging]);

  const handleZoom = (direction) => {
    setZoom((prevZoom) => Math.min(5, Math.max(1, prevZoom + direction * 0.5)));
  };

  const handleDrag = (_, info) => {
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newTime =
        (info.point.x / containerWidth) * videoRef.current.duration;
      if (!isNaN(newTime) && isFinite(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  return (
    <div className="relative w-full max-w-3xl mt-4 bg-gray-100 rounded-lg p-4">
      <div className="flex justify-between mb-2">
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
      <div ref={containerRef} className="relative w-full h-12 overflow-hidden">
        <motion.div
          ref={timelineRef}
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${zoom * 100}%`,
            x: backgroundX,
          }}
        >
          {[...Array(Math.ceil(duration) || 1)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full"
              style={{ left: `${(i / duration) * 100}%` }}
            >
              <div className="h-full w-px bg-gray-300" />
              <div className="absolute top-full mt-1 text-xs text-gray-500 transform -translate-x-1/2">
                {i}s
              </div>
            </div>
          ))}
        </motion.div>
        <motion.div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
          style={{ x }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45 mt-1" />
        </motion.div>
      </div>
    </div>
  );
}

export default Timeline;

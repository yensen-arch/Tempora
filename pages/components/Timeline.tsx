"use client"
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

function Timeline({ videoRef, duration }) {
  const [zoom, setZoom] = useState(1); // Zoom level
  const [scrollX, setScrollX] = useState(0); // Scroll position
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const [dragX, setDragX] = useState(0); // Dragging position

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateScroll = () => {
      if (containerRef.current) {
        const progress = (video.currentTime / video.duration) * 100;
        setScrollX(progress * zoom * 10); // Adjust scroll based on zoom
      }
    };

    video.addEventListener("timeupdate", updateScroll);
    return () => video.removeEventListener("timeupdate", updateScroll);
  }, [videoRef, zoom]);

  const handleZoom = (e) => {
    const newZoom = Math.min(5, Math.max(1, zoom * (e.deltaY > 0 ? 0.9 : 1.1))); // Limit zoom between 1x and 5x
    setZoom(newZoom);
  };

  const handleScroll = (e) => {
    setScrollX((prev) => prev - e.deltaX * 0.5); // Smooth scrolling
  };

  const handleDrag = (event, info) => {
    setDragX(info.point.x);
    if (videoRef.current && timelineRef.current) {
      const newTime = (dragX / (zoom * 200)) * videoRef.current.duration;
      if (!isNaN(newTime) && isFinite(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl mt-4 overflow-x-auto"
      onWheel={(e) => {
        if (e.ctrlKey) handleZoom(e); // Ctrl + Scroll for zoom
        else handleScroll(e);
      }}
    >
      <div
        ref={timelineRef}
        className="relative flex items-center space-x-4"
        style={{ width: `${zoom * 200}%`, transform: `translateX(-${scrollX}px)` }}
      >
        {[...Array(Math.ceil(duration) || 1)].map((_, i) => (
          <div key={i} className="relative h-6 w-10 text-center text-sm text-gray-500">
            {i}s
          </div>
        ))}
      </div>
      {/* Draggable Center Indicator */}
      <motion.div 
        className="absolute top-0 left-1/2 w-1 h-8 bg-red-500 transform -translate-x-1/2 cursor-pointer"
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        onDrag={handleDrag}
      />
    </div>
  );
}

export default Timeline;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(duration);
  const [showTrim, setShowTrim] = useState(false);
  const [editHistory, setEditHistory] = useState<
    { start: number; end: number; type: "trim" | "splice" }[]
  >([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSlider = () => {
      if (containerRef.current && !isDragging) {
        const currentTime = video.currentTime;
        const visibleDuration = visibleEnd - visibleStart;
        const progress = (currentTime - visibleStart) / visibleDuration;
        const containerWidth = containerRef.current.offsetWidth;
        sliderX.set(
          Math.max(0, Math.min(containerWidth, progress * containerWidth))
        );
      }
      if (video.currentTime >= visibleEnd) {
        video.pause();
      }
    };

    video.addEventListener("timeupdate", updateSlider);
    return () => video.removeEventListener("timeupdate", updateSlider);
  }, [videoRef, sliderX, isDragging, visibleStart, visibleEnd]);

  const handleZoom = (direction: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(5, Math.max(1, prevZoom + direction * 0.5));
      const midpoint = (visibleStart + visibleEnd) / 2;
      const visibleDuration = duration / newZoom;
      const newStart = Math.max(0, midpoint - visibleDuration / 2);
      const newEnd = Math.min(duration, midpoint + visibleDuration / 2);
      setVisibleStart(newStart);
      setVisibleEnd(newEnd);
      return newZoom;
    });
  };

  const handleDrag = (_, info: { point: { x: number } }) => {
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const progress = Math.max(0, Math.min(1, info.point.x / containerWidth));
      const newTime = visibleStart + progress * (visibleEnd - visibleStart);

      if (!isNaN(newTime) && isFinite(newTime)) {
        videoRef.current.currentTime = Math.max(
          visibleStart,
          Math.min(visibleEnd, newTime)
        );
      }
    }
  };

  const handleTrimUpdate = (start: number, end: number) => {
    setEditHistory((prev) => [...prev, { start, end, type: "trim" }]);
    setVisibleStart(start);
    setVisibleEnd(end);

    if (videoRef.current) {
      videoRef.current.currentTime = start;
    }
  };

  const currentTrim = editHistory[editHistory.length - 1] || {
    start: 0,
    end: duration,
  };
  const trimStartPercent = (currentTrim.start / duration) * 100;
  const trimWidthPercent =
    ((currentTrim.end - currentTrim.start) / duration) * 100;

  return (
    <div className="relative w-full max-w-3xl mt-4 rounded-lg p-8">
      {/* Rest of the component remains the same until the timeline section */}
      <div className="relative">
        <button
          onClick={() => setShowTrim(true)}
          className="mb-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Pre Cut
        </button>
        <div
          ref={containerRef}
          className="relative w-full h-20 overflow-hidden border-b border-gray-200"
        >
          {showTrim && (
            <TrimOverlay
              duration={duration}
              onTrimChange={handleTrimUpdate}
              onClose={() => setShowTrim(false)}
              initialStart={currentTrim.start}
              initialEnd={currentTrim.end}
            />
          )}

          <div
            className="absolute h-12 bg-opacity-50"
            style={{
              width: `${trimWidthPercent}%`,
              left: `${trimStartPercent}%`,
            }}
          />

          <div className="absolute top-0 left-0 h-12 p-4 w-full">
            {Array.from({
              length: Math.ceil((visibleEnd - visibleStart) / zoom) + 1,
            }).map((_, i) => {
              const time = visibleStart + i * zoom;
              if (time > visibleEnd) return null;
              return (
                <div
                  key={i}
                  className="absolute top-0 h-8"
                  style={{
                    left: `${
                      ((time - visibleStart) / (visibleEnd - visibleStart)) *
                      100
                    }%`,
                  }}
                >
                  <div className="h-full w-px bg-black" />
                  <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
                    {time.toFixed(1)}s
                  </div>
                </div>
              );
            })}
          </div>

          <motion.div
            className="absolute top-0 w-0.5 h-12 bg-red-500 z-10"
            style={{ x: sliderX }}
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
    </div>
  );
};

export default Timeline;

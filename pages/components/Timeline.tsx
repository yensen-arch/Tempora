"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue } from "framer-motion"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import TrimOverlay from "./TrimOverlay"

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>
  duration: number
}

const Timeline: React.FC<TimelineProps> = ({ videoRef, duration }) => {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderX = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const [visibleStart, setVisibleStart] = useState(0)
  const [visibleEnd, setVisibleEnd] = useState(duration)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateSlider = () => {
      if (containerRef.current && !isDragging) {
        const progress = (video.currentTime - visibleStart) / (visibleEnd - visibleStart)
        const containerWidth = containerRef.current.offsetWidth
        sliderX.set(progress * containerWidth)
      }
      if (video.currentTime >= visibleEnd) {
        video.pause()
      }
    }

    video.addEventListener("timeupdate", updateSlider)
    return () => video.removeEventListener("timeupdate", updateSlider)
  }, [videoRef, sliderX, isDragging, visibleStart, visibleEnd])

  const handleZoom = (direction: number) => {
    setZoom((prevZoom) => Math.min(5, Math.max(1, prevZoom + direction * 0.5)))
  }

  const handleDrag = (_, info: { point: { x: number } }) => {
    if (videoRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const progress = info.point.x / containerWidth
      const newTime = visibleStart + progress * (visibleEnd - visibleStart)

      if (!isNaN(newTime) && isFinite(newTime) && newTime >= visibleStart && newTime <= visibleEnd) {
        videoRef.current.currentTime = newTime
      }
    }
  }

  const [showTrim, setShowTrim] = useState(false)
  const [editHistory, setEditHistory] = useState<{ start: number; end: number; type: "trim" | "splice" }[]>([])

  const handleTrimUpdate = (start: number, end: number) => {
    setEditHistory((prev) => [...prev, { start, end, type: "trim" }])

    setVisibleStart(start)
    setVisibleEnd(end)

    if (videoRef.current) {
      videoRef.current.currentTime = start
    }

    console.log(editHistory)
  }

  const visibleStart2 = editHistory.length ? editHistory[editHistory.length - 1].start : 0
  const visibleEnd2 = editHistory.length ? editHistory[editHistory.length - 1].end : duration
  const progressWidth = ((visibleEnd2 - visibleStart2) / duration) * 100

  return (
    <div className="relative w-full max-w-3xl mt-4 bg-gray-100 rounded-lg p-8">
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <button onClick={() => handleZoom(-1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => handleZoom(1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
            <ZoomIn size={16} />
          </button>
          <span className="text-sm text-gray-600">Zoom: {zoom.toFixed(1)}x</span>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronLeft size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">Drag to navigate</span>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
      <div className="relative">
        <button onClick={() => setShowTrim(true)} className="mb-2 px-3 py-1 bg-blue-500 text-white rounded">
          Pre Cut
        </button>
        <div ref={containerRef} className="relative w-full h-20 overflow-hidden border-b border-gray-200">
          {showTrim && (
            <TrimOverlay duration={duration} onTrimChange={handleTrimUpdate} onClose={() => setShowTrim(false)} />
          )}

          {/* Trimmed section overlay */}
          <div
            className="absolute  h-12"
            style={{
              width: `${progressWidth}%`,
              left: `${(visibleStart2 / duration) * 100}%`,
            }}
          />

          {/* Stationary timeline */}
          <div className="absolute top-0 left-0 h-12 p-4 w-full">
            {/* Time markers */}
            {[...Array(Math.ceil(visibleEnd - visibleStart) + 1)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-8"
                style={{ left: `${(i / (visibleEnd - visibleStart)) * 100}%` }}
              >
                <div className="h-full w-px bg-black" />
                <div className="absolute top-full transform -translate-x-1/2 text-xs text-gray-500 mt-1">
                  {(visibleStart + i).toFixed(1)}s
                </div>
              </div>
            ))}
          </div>

          {/* Movable red slider */}
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
  )
}

export default Timeline


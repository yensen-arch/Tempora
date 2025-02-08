"use client"
import { useRef, useState, useEffect } from "react"

function Timeline({ videoRef }) {
  const [progress, setProgress] = useState(0)
  const timelineRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100)
    }

    video.addEventListener("timeupdate", updateProgress)
    return () => video.removeEventListener("timeupdate", updateProgress)
  }, [videoRef])

  const handleSeek = (e) => {
    if (!videoRef.current) return
    const newTime = (e.target.value / 100) * videoRef.current.duration
    if (!isNaN(newTime) && isFinite(newTime)) {
      videoRef.current.currentTime = newTime
    }
  }

  return (
    <div className="relative w-full max-w-3xl mt-4">
      <input
        type="range"
        ref={timelineRef}
        className="w-full cursor-pointer"
        min="0"
        max="100"
        value={progress}
        onChange={handleSeek}
      />
    </div>
  )
}

export default Timeline


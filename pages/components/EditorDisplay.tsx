"use client"
import { useRef, useEffect } from "react"
import Timeline from "./Timeline"

function EditorDisplay({ videoUrl }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [videoRef]) //Fixed unnecessary dependency

  return (
    <div className="flex flex-col items-center p-4">
      {videoUrl ? (
        <>
          <video ref={videoRef} controls className="w-full max-w-3xl">
            <source src={decodeURIComponent(videoUrl)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Timeline videoRef={videoRef} />
        </>
      ) : (
        <p>No video URL provided.</p>
      )}
    </div>
  )
}

export default EditorDisplay


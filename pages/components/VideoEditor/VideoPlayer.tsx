import React, { useState, useEffect } from "react";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoRef, src }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => setCurrentTime(video.currentTime);
      video.addEventListener('timeupdate', updateTime);
      return () => video.removeEventListener('timeupdate', updateTime);
    }
  }, [videoRef]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full max-h-[400px] object-contain mb-4"
      />
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default VideoPlayer;


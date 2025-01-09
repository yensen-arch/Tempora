import React from "react";

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoRef, src }) => {
  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full max-h-[400px] object-contain mb-4"
    />
  );
};

export default VideoPlayer;


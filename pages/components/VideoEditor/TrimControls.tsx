import React from "react";
import Timeline from "./Timeline";

interface TrimControlsProps {
  startTime: number;
  endTime: number;
  duration: number;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const TrimControls: React.FC<TrimControlsProps> = ({
  startTime,
  endTime,
  duration,
  setStartTime,
  setEndTime,
  videoRef,
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Timeline
        duration={duration}
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        videoRef={videoRef}
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>Start: {formatTime(startTime)}</span>
        <span>Trimmed Duration: {formatTime(endTime - startTime)}</span>
        <span>End: {formatTime(endTime)}</span>
      </div>
    </div>
  );
};

export default TrimControls;

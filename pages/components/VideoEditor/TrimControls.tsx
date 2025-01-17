import React, { useEffect, useState } from "react";
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
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Keep the currentDuration in sync with the duration prop
  useEffect(() => {
    setDuration(duration);
  }, [duration]);

  const [currentDuration, setDuration] = useState(duration);

  return (
    <div className="space-y-4">
      <Timeline
        duration={currentDuration}
        setDuration={setDuration}
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={(time) => {
          if (time >= 0 && time <= endTime) {
            setStartTime(time);
          }
        }}
        onEndTimeChange={(time) => {
          if (time >= startTime && time <= currentDuration) {
            setEndTime(time);
          }
        }}
        videoRef={videoRef}
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>Trimmed Duration: {formatTime(endTime - startTime)}</span>
      </div>
    </div>
  );
};

export default TrimControls;

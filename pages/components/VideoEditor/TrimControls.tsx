import React, { useEffect, useState } from "react";
import Timeline from "./Timeline";

interface Selection {
  start: number;
  end: number;
}

interface TrimControlsProps {
  startTime: number;
  endTime: number;
  duration: number;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  selections: Selection[];
  setSelections: (selections: Selection[]) => void;
}

const TrimControls: React.FC<TrimControlsProps> = ({
  startTime,
  endTime,
  duration,
  setStartTime,
  setEndTime,
  videoRef,
  selections,
  setSelections,
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
    </div>
  );
};

export default TrimControls;

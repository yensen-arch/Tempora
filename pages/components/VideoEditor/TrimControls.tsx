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

  const addSelection = () => {
    const newSelection: Selection = { start: startTime, end: endTime };
    setSelections([...selections, newSelection]);
  };

  const removeSelection = (index: number) => {
    const updatedSelections = selections.filter((_, i) => i !== index);
    setSelections(updatedSelections);
  };

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
      <button
        onClick={addSelection}
        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
      >
        Save Selection
      </button>
      <ul className="space-y-2">
        {selections.map((selection, index) => (
          <li key={index} className="flex items-center justify-between">
            <span>
              {formatTime(selection.start)} - {formatTime(selection.end)}
            </span>
            <button
              onClick={() => removeSelection(index)}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrimControls;

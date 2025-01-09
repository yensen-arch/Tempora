import React from "react";
import TimeInput from "./TimeInput";
import { formatTime } from "./utils";

interface TrimControlsProps {
  startTime: number;
  endTime: number;
  duration: number;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
}

const TrimControls: React.FC<TrimControlsProps> = ({
  startTime,
  endTime,
  duration,
  setStartTime,
  setEndTime,
}) => {
  return (
    <>
      <div className="relative pt-1">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{formatTime(startTime)}</span>
          <span>{formatTime(endTime)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={endTime}
          onChange={(e) => setEndTime(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TimeInput
          id="startTime"
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          min={0}
          max={endTime}
        />
        <TimeInput
          id="endTime"
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          min={startTime}
          max={duration}
        />
      </div>
    </>
  );
};

export default TrimControls;


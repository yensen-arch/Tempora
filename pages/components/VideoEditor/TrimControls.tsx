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
  videoUrl: string;
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
  videoUrl,
}) => {
  const [currentDuration, setDuration] = useState(duration);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setDuration(duration);
  }, [duration]);

  const trimVideo = async () => {
    setIsProcessing(true);
    console.log("selections:",selections)    

  };

  return (
    <div className="">
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
        selections={selections}
        setSelections={setSelections}
      />
      <button
        onClick={trimVideo}
        disabled={isProcessing || selections.length === 0}
        className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Trim Video'}
      </button>
      {trimmedVideoUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Trimmed Video:</h3>
          <video src={trimmedVideoUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default TrimControls;


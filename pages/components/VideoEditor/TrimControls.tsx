import React, { useEffect, useState } from "react";
import Timeline from "./Timeline";
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

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

  const ffmpeg = createFFmpeg({ log: true });

  const trimVideo = async () => {
    setIsProcessing(true);
    await ffmpeg.load();

    const inputName = 'input.mp4';
    ffmpeg.FS('writeFile', inputName, await fetchFile(videoUrl));

    let outputName = 'output.mp4';
    let concatList = '';

    for (let i = 0; i < selections.length; i++) {
      const { start, end } = selections[i];
      const segmentName = `segment_${i}.mp4`;
      await ffmpeg.run('-i', inputName, '-ss', `${start}`, '-to', `${end}`, '-c', 'copy', segmentName);
      concatList += `file ${segmentName}\n`;
    }

    ffmpeg.FS('writeFile', 'concat_list.txt', concatList);
    await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', outputName);

    const data = ffmpeg.FS('readFile', outputName);
    const trimmedUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setTrimmedVideoUrl(trimmedUrl);
    setIsProcessing(false);
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
        selections={selections}
        setSelections={setSelections}
      />
      <button
        onClick={trimVideo}
        disabled={isProcessing || selections.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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


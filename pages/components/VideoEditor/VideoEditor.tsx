"use client";

import React, { useState, useEffect, useRef } from "react";
import * as ffmpeg from "@ffmpeg/ffmpeg"; 
import VideoPlayer from "./VideoPlayer";
import TrimControls from "./TrimControls";
import EditedVideoSection from "./EditedVideoSection";

interface Selection {
  start: number;
  end: number;
}

interface EditingWindowProps {
  selectedMedia: {
    resourceType: string;
    url: string;
  };
}

const VideoEditor: React.FC<EditingWindowProps> = ({ selectedMedia }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [duration, setDuration] = useState<number>(0);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [editedMedia, setEditedMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ffmpeg, setFFmpeg] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadFFmpeg = async () => {
    if (!ffmpeg) {
      const ffmpegInstance = await ffmpeg.createFFmpeg({ log: true });
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
          setEndTime(videoRef.current.duration);
        }
      };
    }
  }, [selectedMedia]);

  const handleTrimVideo = async () => {
    if (!selections.length) return;

    setLoading(true);
    await loadFFmpeg();

    const inputName = "input.mp4";
    ffmpeg.FS("writeFile", inputName, await fetchFile(selectedMedia.url));

    let outputName = "output.mp4";
    let concatList = "";

    for (let i = 0; i < selections.length; i++) {
      const { start, end } = selections[i];
      const segmentName = `segment_${i}.mp4`;
      await ffmpeg.run(
        "-i",
        inputName,
        "-ss",
        `${start}`,
        "-to",
        `${end}`,
        "-c",
        "copy",
        segmentName
      );
      concatList += `file '${segmentName}'\n`;
    }

    ffmpeg.FS("writeFile", "concat_list.txt", concatList);
    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "concat_list.txt",
      "-c",
      "copy",
      outputName
    );

    const data = ffmpeg.FS("readFile", outputName);
    const trimmedUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setEditedMedia(trimmedUrl);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Video Editor</h2>
        <VideoPlayer videoRef={videoRef} src={selectedMedia?.url || ""} />
        <div className="space-y-4 mt-4">
          <TrimControls
            startTime={startTime}
            endTime={endTime}
            duration={duration}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
            videoRef={videoRef}
            selections={selections}
            setSelections={setSelections}
            videoUrl={selectedMedia?.url || ""}
          />
          <button
            onClick={handleTrimVideo}
            disabled={loading || selections.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Trim Video"}
          </button>
        </div>
        {editedMedia && <EditedVideoSection src={editedMedia} />}
      </div>
    </div>
  );
};

export default VideoEditor;

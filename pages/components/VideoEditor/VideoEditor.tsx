"use client";

import React, { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
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
  const [ffmpegInstance, setFFmpeg] = useState<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegModule = await import("@ffmpeg/ffmpeg");
      const ffmpegInstance = new ffmpegModule.FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    loadFFmpeg();
  }, []);

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

  const handleCompile = async () => {
    if (!ffmpegInstance || selections.length === 0) return;

    try {
      setLoading(true);

      const inputData = await ffmpegInstance.fetchFile(selectedMedia.url);
      ffmpegInstance.FS("writeFile", "input.mp4", inputData);

      for (const [index, { start, end }] of selections.entries()) {
        await ffmpegInstance.run(
          "-i",
          "input.mp4",
          "-ss",
          `${start}`,
          "-to",
          `${end}`,
          "-c",
          "copy",
          `output_${index}.mp4`
        );
      }

      const mergedFile = "output_merged.mp4";
      const filterComplex = selections
        .map((_, index) => `[${index}:v:0][${index}:a:0]`)
        .join("");
      await ffmpegInstance.run(
        "-i",
        `concat:${selections
          .map((_, index) => `output_${index}.mp4`)
          .join("|")}`,
        "-c",
        "copy",
        mergedFile
      );

      const data = ffmpegInstance.FS("readFile", mergedFile);
      const compiledURL = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      setEditedMedia(compiledURL);
    } catch (error) {
      console.error("Error during video compilation:", error);
    } finally {
      setLoading(false);
    }
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
          />
        </div>
        {editedMedia && <EditedVideoSection src={editedMedia} />}
      </div>
    </div>
  );
};

export default VideoEditor;

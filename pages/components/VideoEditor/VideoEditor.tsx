"use client";

import React, { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import VideoPlayer from "./VideoPlayer";
import TrimControls from "./TrimControls";
import TrimButton from "./TrimButton";
import EditedVideoSection from "./EditedVideoSection";

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

  const handleTrim = async () => {
    if (!ffmpegInstance) return;

    try {
      setLoading(true);

      const inputData = await ffmpegInstance.fetchFile(selectedMedia.url);
      ffmpegInstance.FS("writeFile", "input.mp4", inputData);

      await ffmpegInstance.run(
        "-i",
        "input.mp4",
        "-ss",
        `${startTime}`,
        "-to",
        `${endTime}`,
        "-c",
        "copy",
        "output.mp4"
      );

      const data = ffmpegInstance.FS("readFile", "output.mp4");
      const trimmedURL = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      setEditedMedia(trimmedURL);
    } catch (error) {
      console.error("Error during video trimming:", error);
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
          />
          <TrimButton onClick={handleTrim} loading={loading} disabled={!ffmpegInstance} />
        </div>
        {editedMedia && <EditedVideoSection src={editedMedia} />}
      </div>
    </div>
  );
};

export default VideoEditor;


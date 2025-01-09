"use client";

import React, { useState, useEffect, useRef } from "react";
import FFmpeg from "@ffmpeg/ffmpeg";

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
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = createFFmpeg({ log: true });
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
    if (!ffmpeg) return;

    try {
      setLoading(true);

      const inputData = await fetchFile(selectedMedia.url);
      ffmpeg.FS("writeFile", "input.mp4", inputData);

      await ffmpeg.run(
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

      const data = ffmpeg.FS("readFile", "output.mp4");
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Video Editor</h2>
        <video
          ref={videoRef}
          src={selectedMedia?.url || ""}
          controls
          className="w-full max-h-[400px] object-contain mb-4"
        />
        <div className="space-y-4">
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
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="startTime"
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                min={0}
                max={endTime}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="endTime"
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                min={startTime}
                max={duration}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={handleTrim}
            disabled={loading || !ffmpeg}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Trim Video
              </span>
            )}
          </button>
        </div>

        {editedMedia && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Edited Video</h3>
            <video
              src={editedMedia}
              controls
              className="w-full max-h-[400px] object-contain"
            />
            <a
              href={editedMedia}
              download="edited-video.mp4"
              className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download Edited Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;


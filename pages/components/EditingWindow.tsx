"use client";

import React, { useState, useEffect } from "react";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

interface EditingWindowProps {
  selectedMedia: {
    resourceType: string;
    url: string;
  };
}

const EditingWindow: React.FC<EditingWindowProps> = ({ selectedMedia }) => {
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [editedMedia, setEditedMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = createFFmpeg({ log: true });
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    loadFFmpeg();
  }, []);

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

  return (
    <div>
      <h2>Editing Window</h2>
      <video
        src={selectedMedia.url}
        controls
        style={{ width: "100%", maxHeight: "400px" }}
      />
      <div>
        <label>
          Start Time (seconds):{" "}
          <input
            type="number"
            value={startTime}
            onChange={(e) => setStartTime(Number(e.target.value))}
            min="0"
          />
        </label>
        <label>
          End Time (seconds):{" "}
          <input
            type="number"
            value={endTime}
            onChange={(e) => setEndTime(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>
      <button onClick={handleTrim} disabled={loading || !ffmpeg}>
        {loading ? "Processing..." : "Trim Video"}
      </button>

      {editedMedia && (
        <div>
          <h3>Edited Media</h3>
          <video
            src={editedMedia}
            controls
            style={{ width: "100%", maxHeight: "400px" }}
          />
          <a href={editedMedia} download="edited-video.mp4">
            Download Edited Video
          </a>
        </div>
      )}
    </div>
  );
};

export default EditingWindow;

"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);

 

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

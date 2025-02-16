"use client";
import React, { useState, useEffect } from "react";
import { processAudio } from "../../utils/ffmpegUtils";

function EditMachine({ videoUrl, edits, submitClicked, audioUrl }: { videoUrl: string; edits: any, submitClicked: boolean, audioUrl: string }) {
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  useEffect(() => {
    const runFFmpeg = async () => {
      setProcessedVideo("");
      const outputUrl = await processAudio(audioUrl, edits);
      setProcessedVideo(outputUrl);
    };
    console.log("here");

    runFFmpeg();
  }, [submitClicked]);

  return (
    <div>
      <h2>Ignore this for now</h2>
      {processedVideo ? <audio controls src={processedVideo} /> : <p>Processing...</p>}
    </div>
  );
}

export default EditMachine;

"use client";
import React, { useState, useEffect } from "react";
import { processVideo } from "../../utils/ffmpegUtils";

function EditMachine({ videoUrl, edits, submitClicked }: { videoUrl: string; edits: any, submitClicked: boolean }) {
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  useEffect(() => {
    const runFFmpeg = async () => {
      setProcessedVideo("");
      const outputUrl = await processVideo(videoUrl, edits);
      setProcessedVideo(outputUrl);
    };
    console.log("here");

    runFFmpeg();
  }, [submitClicked]);

  return (
    <div>
      <h2>Ignore this for now</h2>
      {processedVideo ? <video controls src={processedVideo} /> : <p>Processing...</p>}
    </div>
  );
}

export default EditMachine;

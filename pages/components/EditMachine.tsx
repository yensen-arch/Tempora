"use client";
import React, { useState, useEffect } from "react";
import { processVideo } from "../../utils/ffmpegUtils";

function EditMachine({ videoUrl, edits }: { videoUrl: string; edits: any }) {
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  useEffect(() => {
    const runFFmpeg = async () => {
      const outputUrl = await processVideo(videoUrl, edits);
      setProcessedVideo(outputUrl);
    };

    runFFmpeg();
  }, [videoUrl, edits]);

  return (
    <div>
      <h2>Ignore this for now</h2>
      {processedVideo ? <video controls src={processedVideo} /> : <p>Processing...</p>}
    </div>
  );
}

export default EditMachine;

"use client";
import React, { useState, useEffect } from "react";
import { processAudio } from "../../utils/ffmpegUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

function EditMachine({ edits, submitClicked, audioUrl }: { edits: any, submitClicked: boolean, audioUrl: string }) {
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const { user, isLoading } = useUser();
  const email = user?.email;

  if (!user?.email) {
    return (
      <div className="p-8 text-center">Please sign in to upload files.</div>
    );
  }

  useEffect(() => {
    const runFFmpeg = async () => {
      const outputUrl = await processAudio(audioUrl, edits);
      console.log(outputUrl);
      setProcessedAudio(outputUrl);
    };
    
    runFFmpeg();
  }, [submitClicked]);

  const getFileFromBlob = async(bloburl: string, filename: string) =>{
    const resp = await fetch(bloburl);
    const blob = await resp.blob();
    return new File([blob], filename, {type: blob.type});
  }

  const handleProceed = async(fileUrl: string)=>{
    const file = await getFileFromBlob(fileUrl, 'processedAudio');
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch(`api/processed-audio/upload?email=${email}`, {
      method: 'POST',
      body: formData
    });
    if(resp.status===200){
      alert('File uploaded successfully');
      window.location.href = '/checkout';
    }else {
      alert('Failed to upload file, Try again in sometime');
    }
  }

  return (
    <div>
      <h2>Ignore this for now</h2>
      {processedAudio ? (
        <>
          <audio controls src={processedAudio} controlsList="nodownload"/>
          <button onClick={() => handleProceed(processedAudio)}>Proceed to Checkout -&gt;</button>
        </>
      ) : (
        <p>Processing...</p>
      )}
    </div>
  );
}

export default EditMachine;

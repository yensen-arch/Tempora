"use client";
import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { processAudio } from "../../utils/ffmpegUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

function EditMachine({
  edits,
  submitClicked,
  setSubmitClicked,
  audioUrl,
  setProcessing
}: {
  edits: any;
  submitClicked: boolean;
  audioUrl: string;
  setSubmitClicked: (value: boolean) => void;
  setProcessing: (value: boolean) => void;
}) {
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferInstance = useRef<WaveSurfer | null>(null);
  const { user, isLoading } = useUser();
  const email = user?.email;

  useEffect(() => {
    const runFFmpeg = async () => {
      if(submitClicked){
        setProcessing(true);
        const outputUrl = await processAudio(audioUrl, edits);
        setProcessedAudio(outputUrl);
        setIsModalOpen(true);
        setProcessing(false);
        setSubmitClicked(false);
      }
    };

    runFFmpeg();
  }, [submitClicked]);

  useEffect(() => {
    if (processedAudio && waveformRef.current) {
      if (waveSurferInstance.current) {
        waveSurferInstance.current.destroy();
      }

      waveSurferInstance.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4A90E2",
        progressColor: "#357ABD",
        cursorColor: "#FF0000",
        height: 80,
        responsive: true,
        normalize: true,
      });

      waveSurferInstance.current.load(processedAudio);
    }
  }, [processedAudio]);

  if (!user?.email) {
    return (
      <div className="p-8 text-center">Please sign in to upload files.</div>
    );
  }

  const getFileFromBlob = async (bloburl: string, filename: string) => {
    const resp = await fetch(bloburl);
    const blob = await resp.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleProceed = async (fileUrl: string) => {
    const file = await getFileFromBlob(fileUrl, "processedAudio");
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch(`api/processed-audio/upload?email=${email}`, {
      method: "POST",
      body: formData,
    });
    if (resp.status === 200) {
      alert("File uploaded successfully");
      window.location.href = "/checkout";
    } else {
      alert("Failed to upload file, Try again in sometime");
    }
  };

  return (
    <div className="mt-20">
      {isModalOpen && processedAudio && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#f5f0eb] p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-lg font-semibold mb-4">Your final edit will be : </h2>
            
            {/* Waveform */}
            <div ref={waveformRef} className="w-full mb-4"></div>

            <audio controls src={processedAudio} controlsList="nodownload" className="w-full mb-4 bg-[#f5f0eb]" />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => handleProceed(processedAudio)}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Edit This
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditMachine;

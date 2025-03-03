"use client";
import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import { processAudio } from "../../utils/ffmpegUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

function EditMachine({
  edits,
  submitClicked,
  setSubmitClicked,
  audioUrl,
  setProcessing,
}) {
  const [processedAudio, setProcessedAudio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveformRef = useRef(null);
  const waveSurferInstance = useRef(null);
  const { user } = useUser();
  const email = user?.email;

  useEffect(() => {
    const runFFmpeg = async () => {
      if (submitClicked) {
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

  const togglePlayPause = () => {
    if (waveSurferInstance.current) {
      if (waveSurferInstance.current.isPlaying()) {
        waveSurferInstance.current.pause();
        setIsPlaying(false);
      } else {
        waveSurferInstance.current.play();
        setIsPlaying(true);
      }
    }
  };

  if (!user?.email) {
    return <p>Please sign in to upload files.</p>;
  }

  const getFileFromBlob = async (bloburl, filename) => {
    const resp = await fetch(bloburl);
    const blob = await resp.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleProceed = async (fileUrl) => {
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
      alert("Failed to upload file, Try again later");
    }
  };

  return (
    <>
      {isModalOpen && processedAudio && (
        <div className="modal">
          <h2>Your final edit will be:</h2>
          <div ref={waveformRef} className="waveform" />
          <button
            onClick={togglePlayPause}
            className="bg-black hover:bg-gray-600 text-white px-2 py-2 rounded-full mt-2 flex items-center gap-2"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleProceed(processedAudio)}
              className="bg-black text-white border border-black hover:bg-white hover:text-black px-4 py-2 rounded-md"
            >
              Checkout
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-black text-white border border-black hover:bg-white hover:text-black px-4 py-2 rounded-md"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default EditMachine;

"use client";
import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import { processAudio } from "../../utils/ffmpegUtils";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import UpgradeProductModal from "./UpgradeProductModal";

function EditMachine({
  edits,
  submitClicked,
  setSubmitClicked,
  handleSave,
  audioUrl,
  setProcessing,
}) {
  const [processedAudio, setProcessedAudio] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isDurationWarningOpen, setIsDurationWarningOpen] = useState(false);
  const waveformRef = useRef(null);
  const waveSurferInstance = useRef(null);
  const { user } = useUser();
  const router = useRouter();
  const email = user?.email;

  useEffect(() => {
    const runFFmpeg = async () => {
      if (submitClicked) {
        console.log(edits)
        setProcessing(true);
        let outputUrl
        if (edits.length !== 0) {
          outputUrl = await processAudio(audioUrl, edits);
        } else {
          outputUrl = audioUrl;
        }
        setProcessedAudio(outputUrl);
        setIsModalOpen(true);
        setProcessing(false);
        setSubmitClicked(false);
      }
    };
    runFFmpeg();
  }, [submitClicked, audioUrl, edits, setProcessing, setSubmitClicked]);

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

  const getFileFromBlob = async (blobUrl: any, filename: string) => {
    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const getAudioDuration = (file: any) => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
    });
  };

  const handleProceed = async (fileUrl) => {
    const response = await fetch("/api/cart/get_items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    const res = await response.json();
    setCartData(res);
    const item = res?.[0];
    console.log(item);

    setCheckingOut(true);
    const file = await getFileFromBlob(fileUrl, "processedAudio");
    const duration = await getAudioDuration(file);
    setAudioDuration(duration);
    console.log(duration);

    // Check if audio duration exceeds the product minutes limit
    // Convert minutes to seconds for comparison
    const productMinutesInSeconds = (item.minutes || 0) * 60;

    if (duration > productMinutesInSeconds) {
      const products = await fetch("api/products/get_available_products");
      const productsData = await products.json();
      const largerProduct = productsData.data.find(
        (product: any) => product.minutes * 60 >= duration
      );
      if (!largerProduct) {
        alert("You caught us! Your audio duration exceeds the maximum duration for all available products. Please contact support for assistance.");
        setCheckingOut(false);
        return;
      }
      setIsDurationWarningOpen(true);
      setCheckingOut(false);
    } else {
      proceedToCheckout(file);
    }
  };

  const proceedToCheckout = async (file) => {

    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch(`api/processed-audio/upload?email=${email}`, {
      method: "POST",
      body: formData,
    });
    if (resp.status === 200) {
      window.location.href = "/checkout";
    } else {
      alert("Failed to upload file, Try again later");
      setCheckingOut(false);
    }

  };

  const handleSwitchToLargerProduct = async () => {
    try {
      await fetch("/api/cart/upgrade_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          audioDuration: audioDuration
        }),
      });

      setIsDurationWarningOpen(false);

      const file = await getFileFromBlob(processedAudio, "processedAudio");
      proceedToCheckout(file);
    } catch (error) {
      console.error("Error upgrading product:", error);
      alert("Failed to upgrade product. Please try again.");
      setCheckingOut(false);
    }
  };

  const handleBrowseProducts = async () => {
    await handleSave();
    if (router.pathname !== "/") {
      // Navigate to the home page, then scroll
      router.push("/").then(() => {
        // Delay to ensure navigation is complete before scrolling
        setTimeout(() => {
          // Access the productsRef on the home page
          const productsSection =
            document.getElementById("products-section");
          if (productsSection) {
            productsSection.scrollIntoView({
              behavior: "smooth",
            });
          }
        }, 200); // Adjust the delay as needed
      });
    };
  }

    return (
      <>
        {isModalOpen && processedAudio && (
          <div className="modal">
            <h2>Your final Audio will be:</h2>
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
                className="bg-black text-white border border-black hover:bg-white hover:text-black px-4 py-2 rounded-md disabled:bg-opacity-50"
                disabled={checkingOut}
              >
                {checkingOut ? "Please Wait" : "Checkout"}
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

        <UpgradeProductModal
          isOpen={isDurationWarningOpen}
          onClose={() => setIsDurationWarningOpen(false)}
          productMinutes={cartData?.[0]?.minutes || 0}
          audioDuration={audioDuration}
          onSwitchProduct={handleSwitchToLargerProduct}
          onBrowseProducts={handleBrowseProducts}
        />
      </>
    );
  }

  export default EditMachine;
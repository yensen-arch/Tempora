"use client";
import { useRef, useEffect, useState } from "react";
import Timeline from "./Timeline";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useMediaLoader } from "../../lib/hooks/useMediaLoader";

function EditorDisplay({
  videoUrl: initialVideoUrl,
  duration: initialDuration,
  audioPath,
}) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  const [audioUrl, setAudioUrl] = useState(audioPath || "");
  const [duration, setDuration] = useState(initialDuration || 0);
  const [loading, setLoading] = useState(!initialVideoUrl);
  const [error, setError] = useState(null);
  const [noMedia, setNoMedia] = useState(false);
  const videoRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();
  const email = user?.email;
  
  // Use the improved useMediaLoader hook
  const { decodedUrl, decodedAudioUrl, isLoading: mediaLoading, error: mediaError } = useMediaLoader(email);

  useEffect(() => {
    if (initialVideoUrl) {
      setVideoUrl(initialVideoUrl);
      setLoading(false);
    }
  }, [initialVideoUrl]);

  useEffect(() => {
    if (initialDuration) {
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  useEffect(() => {
    if (audioPath) {
      setAudioUrl(audioPath);
    }
  }, [audioPath]);
  
  // Update video and audio URLs when they're loaded from the hook
  useEffect(() => {
    if (decodedUrl) {
      setVideoUrl(decodedUrl);
      setLoading(false);
      setNoMedia(false);
    } else if (!mediaLoading && !decodedUrl) {
      // If loading is complete and we still don't have a URL, it means no media was found
      setNoMedia(true);
      setLoading(false);
    }
  }, [decodedUrl, mediaLoading]);
  
  useEffect(() => {
    if (decodedAudioUrl) {
      setAudioUrl(decodedAudioUrl);
    }
  }, [decodedAudioUrl]);
  
  // Update loading and error states from the hook
  useEffect(() => {
    setLoading(mediaLoading);
  }, [mediaLoading]);
  
  useEffect(() => {
    if (mediaError) {
      setError(mediaError);
      console.warn("Media loading error:", mediaError);
    }
  }, [mediaError]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleDelete = async () => {
    if (!email || !videoUrl) {
      console.log("No email or videoUrl");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmed) {
      console.log("File deletion cancelled.");
      return;
    }

    try {
      const response = await fetch("/api/cart/delete_media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fileUrl: videoUrl,
          resourceType: "video",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("File deleted successfully");
        router.push("/");
      } else {
        alert(data.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while deleting the file");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {loading && <div className="text-center flex justify-center"><p className="text-gray-500">Loading video...</p></div>}
      {error && error !== "Please upload your media file" ? (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          {error === "Please go back and upload your videos first" && (
            <button
              onClick={() => router.push("/upload")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Go Back
            </button>
          )}
        </div>
      ) : noMedia ? (
        <div className=" h-screen justify-center items-center flex flex-col text-center p-8 max-w-md mx-auto">
          <p className="text-xl mb-4">No media found</p>
          <p className="mb-6">Please select a product and upload your media</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Select a Product
            </button>
           
          </div>
        </div>
      ) : !loading && videoUrl ? (
        <>
          <button
            onClick={handleDelete}
            className="absolute top-15 right-10 px-3 py-2 bg-black text-white border-none cursor-pointer rounded-full"
          >
            Delete
          </button>
          <video
            ref={videoRef}
            controls
            controlsList="nodownload"
            className="w-full max-w-3xl"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Timeline videoRef={videoRef} duration={duration} />
        </>
      ) : null}
    </div>
  );
}

export default EditorDisplay;

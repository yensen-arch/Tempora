"use client"
import { useRef, useEffect, useState } from "react";
import Timeline from "./Timeline";
import { useUser } from "@auth0/nextjs-auth0/client";

function EditorDisplay({ videoUrl: initialVideoUrl, duration: initialDuration }) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  const [duration, setDuration] = useState(initialDuration || 0);
  const [loading, setLoading] = useState(!initialVideoUrl);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { user } = useUser();
  const email = user?.email;

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
    if (!initialVideoUrl && !videoUrl && email) {
      setLoading(true);
      fetch("/api/cart/get_uploaded_media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("API Response Data:", data);
          if (data.fileDetails?.length > 0) {
            setVideoUrl(decodeURIComponent(data.fileDetails[0].url));
          } else {
            throw new Error("No files found in the response.");
          }
        })
        .catch((error) => {
          console.error("Error fetching video:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [initialVideoUrl, videoUrl, email]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="flex flex-col items-center p-4">
      {loading && <p className="text-gray-500">Loading video...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && videoUrl ? (
        <>
          <video ref={videoRef} controls className="w-full max-w-3xl">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Timeline videoRef={videoRef} duration={duration} />
        </>
      ) : (
        !loading && <p>No video URL provided.</p>
      )} 
    </div>
  );
}

export default EditorDisplay;

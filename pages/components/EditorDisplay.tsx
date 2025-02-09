"use client"
import { useRef, useEffect, useState } from "react";
import Timeline from "./Timeline";
import { useUser } from "@auth0/nextjs-auth0/client";

function EditorDisplay({ videoUrl: initialVideoUrl }) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || ""); // Use state
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { user, isLoading } = useUser();

  const email = user?.email;

  useEffect(() => {
    if (!initialVideoUrl && !videoUrl && email) {
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
            setVideoUrl(data.fileDetails[0].url);
          } else {
            throw new Error("No files found in the response.");
          }
        })
        .catch((error) => {
          console.error("Error fetching video:", error);
          setError(error.message);
        });
    }
  }, [initialVideoUrl, videoUrl, email]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="flex flex-col items-center p-4">
      {error && <p className="text-red-500">Error: {error}</p>}
      {videoUrl ? (
        <>
          <video ref={videoRef} controls className="w-full max-w-3xl">
            <source src={decodeURIComponent(videoUrl)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Timeline videoRef={videoRef} />
        </>
      ) : (
        <p>No video URL provided.</p>
      )}
    </div>
  );
}

export default EditorDisplay;

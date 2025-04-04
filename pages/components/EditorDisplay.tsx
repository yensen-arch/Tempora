"use client";
import { useRef, useEffect, useState } from "react";
import Timeline from "./Timeline";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

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
  const videoRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();
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
    if (audioPath) {
      setAudioUrl(audioPath);
    }
  }, [audioPath]);

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
            const errorText = res.statusText;
            console.log(res);
            // throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.fileUrl) {
            setVideoUrl(decodeURIComponent(data.fileUrl));
            setAudioUrl(decodeURIComponent(data.audioPath));
            setDuration(data.duration);
          } else {
            // throw new Error("No file URL found in the response.");
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
      {error ? (
        <div className="text-center">
          {error === "Please go back and upload your videos first" && (
            <button
              onClick={() => router.push("/upload")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Go Back
            </button>
          )}
        </div>
      ) : !loading && videoUrl ? (
        <>{/* Existing video player code */}</>
      ) : (
        !loading && (
          <div className="flex items-center min-h-screen">
            {" "}
            <p>Please go back and upload your videos</p>
          </div>
        )
      )}
      {!loading && videoUrl ? (
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

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "react-hot-toast";

function Editor() {
  const { user, isLoading } = useUser();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchMediaUrls();
    }
  }, [user?.email]);

  const email = user?.email;

  const handleUpload = async () => {
    if (!files) {
      toast.error("Please select valid video/audio files.");
      return;
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(
          `/api/cart/upload_items?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (res.ok) {
          toast.success(`File uploaded successfully: ${file.name}`);
        } else {
          toast.error(`Failed to upload file: ${file.name}`);
        }
      } catch (error) {
        toast.error(`Error uploading file: ${file.name}`);
        console.error("Error uploading file:", error);
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    fetchMediaUrls(); // Refresh the displayed media
  };

  const fetchMediaUrls = async () => {
    try {
      const res = await fetch(`/api/cart/get_uploaded_items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrls(data.fileUrls || []);
      } else {
        toast.error("Failed to fetch media URLs.");
      }
    } catch (error) {
      toast.error("Error fetching media URLs.");
      console.error("Error fetching media URLs:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        {isLoading && <div>Loading...</div>}
        {!isLoading && !user && <div>You need to log in to access this page.</div>}
        {!isLoading && user && (
          <>
            <h1 className="text-2xl font-bold mb-4">Upload Video/Audio</h1>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="file-upload"
              >
                Select video/audio files:
              </label>
              <input
                type="file"
                id="file-upload"
                accept="video/*,audio/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full"
              />
            </div>

            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-blue-500 text-white rounded"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <h2 className="text-xl font-bold mt-6 mb-4">Uploaded Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaUrls.length === 0 && <p>No media found.</p>}
              {mediaUrls.map((url, index) => (
                <div key={index} className="border p-4 rounded">
                  {url.endsWith(".mp3") ? (
                    <audio controls src={url} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <video controls src={url} className="w-full">
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Editor;

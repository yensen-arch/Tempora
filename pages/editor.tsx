import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "react-hot-toast";
import { X } from 'lucide-react';

function Editor() {
  const { user, isLoading } = useUser();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<
    { url: string; resourceType: string }[]
  >([]);

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
          `/api/cart/upload_media?email=${encodeURIComponent(email)}`,
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
    fetchMediaUrls();
  };

  const fetchMediaUrls = async () => {
    try {
      const res = await fetch(`/api/cart/get_uploaded_media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrls(data.fileDetails || []);
      } else {
        toast.error("Failed to fetch media URLs.");
      }
    } catch (error) {
      toast.error("Error fetching media URLs.");
      console.error("Error fetching media URLs:", error);
    }
  };

  const handleDelete = async (url: string, resourceType: string) => {
    try {
      const res = await fetch(`/api/cart/delete_media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fileUrl: url, resourceType }),
      });

      if (res.ok) {
        toast.success("File deleted successfully.");
        setMediaUrls((prev) => prev.filter((media) => media.url !== url));
      } else {
        const data = await res.json();
        toast.error(`Failed to delete file: ${data.message}`);
      }
    } catch (error) {
      toast.error("Error deleting file.");
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        {isLoading && <div>Loading...</div>}
        {!isLoading && !user && (
          <div>You need to log in to access this page.</div>
        )}
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
              {mediaUrls.map(({ url, resourceType }, index) => (
                <div key={index} className="relative border p-4 rounded">
                  <button
                    onClick={() => handleDelete(url, resourceType)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full bg-white shadow-md"
                    aria-label="Delete media"
                  >
                    <X size={16} />
                  </button>
                  {resourceType === "audio" ? (
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

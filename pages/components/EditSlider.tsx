'use client'

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { X, ChevronLeft, ChevronRight, Upload, Trash2 } from 'lucide-react';

interface Media {
  url: string;
  resourceType: string;
}

interface EditSliderProps {
  email: string | undefined;
}

const EditSlider: React.FC<EditSliderProps> = ({ email }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<Media[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (email) {
      fetchMediaUrls();
    }
  }, [email]);

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
          `/api/cart/upload_media?email=${encodeURIComponent(email || "")}`,
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
        if (activeIndex >= mediaUrls.length - 1) {
          setActiveIndex(Math.max(0, mediaUrls.length - 2));
        }
      } else {
        const data = await res.json();
        toast.error(`Failed to delete file: ${data.message}`);
      }
    } catch (error) {
      toast.error("Error deleting file.");
      console.error("Error deleting file:", error);
    }
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full min-h-screen bg-stone-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-stone-800">Upload Media</h1>
        <div className="mb-6">
          <label htmlFor="file-upload" className="block text-sm font-medium text-stone-700 mb-2">
            Select video/audio files:
          </label>
          <input
            type="file"
            id="file-upload"
            accept="video/*,audio/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full p-2 border border-stone-300 rounded-md text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-500"
          />
        </div>

        <button
          onClick={handleUpload}
          className={`flex items-center justify-center px-4 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
          <Upload className="ml-2 h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold mt-6 mb-4 text-stone-800">Uploaded Media</h2>
      </div>

      {mediaUrls.length === 0 ? (
        <p className="text-stone-600">No media found.</p>
      ) : (
        <div className="relative w-full max-w-2xl aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            ref={sliderRef}
            className="absolute top-0 left-0 w-full h-full flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {mediaUrls.map(({ url, resourceType }, index) => (
              <div key={index} className="w-full flex-shrink-0 flex items-center justify-center bg-black">
                <div className="relative w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(url, resourceType)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10"
                    aria-label="Delete media"
                  >
                    <Trash2 size={14} />
                  </button>
                  {resourceType === "audio" ? (
                    <audio
                      controls
                      src={url}
                      className="w-full max-w-md"
                      autoPlay={index === activeIndex}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <video
                      controls
                      src={url}
                      className="w-full h-full object-contain"
                      autoPlay={index === activeIndex}
                    >
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-stone-700 hover:bg-stone-600 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 z-10"
            aria-label="Previous media"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-stone-700 hover:bg-stone-600 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 z-10"
            aria-label="Next media"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditSlider;


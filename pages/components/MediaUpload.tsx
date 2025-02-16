"use client";

import React, { useState, type ChangeEvent } from "react";
import { Music, Video, X, Loader2 } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "react-hot-toast";

function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const { user, isLoading } = useUser();
  const email = user?.email;
  const [concatenatedUrl, setConcatenatedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const allowedFormats = [
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
    "video/mpeg",
    "video/webm",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="p-8 text-center">Please sign in to upload files.</div>
    );
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        allowedFormats.includes(file.type)
      );

      if (validFiles.length !== e.target.files.length) {
        toast.error(
          "Invalid file format. Please upload MP3, MP4, or other major audio/video formats."
        );
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setUploadProgress(new Array(validFiles.length).fill(0));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setUploadProgress(uploadProgress.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      const response = await fetch(`/api/cart/upload_media?email=${email}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = "Server error, please try again.";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Upload successful:", data.fileUrls);

      // Only concatenate if there are multiple videos
      if (data.fileUrls && data.fileUrls.length > 1) {
        setUploading(true); // Keep loading state for concatenation
        try {
          const concatenateResponse = await fetch(
            "/api/cart/concatenate_media",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                videoUrls: data.fileUrls,
                email: email,
              }),
            }
          );

          if (!concatenateResponse.ok) {
            throw new Error("Concatenation failed");
          }

          const concatenateData = await concatenateResponse.json();
          setConcatenatedUrl(concatenateData.concatenatedUrl);
          setAudioPath(concatenateData.audioPath);
          setDuration(concatenateData.duration);
          console.log(
            "Concatenation successful:",
            concatenateData.concatenatedUrl
          );
          toast.success("Files uploaded and concatenated successfully!");

          // Call delete API for original uploaded files
          await Promise.all(
            data.fileUrls.map(async (fileUrl) => {
              try {
                const deleteResponse = await fetch("/api/cart/delete_media", {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: email,
                    fileUrl: fileUrl,
                    resourceType: "video",
                  }),
                });

                if (!deleteResponse.ok) {
                  console.error(`Failed to delete file: ${fileUrl}`);
                } else {
                  console.log(`Deleted successfully: ${fileUrl}`);
                }
              } catch (deleteError) {
                console.error(`Error deleting file ${fileUrl}:`, deleteError);
              }
            })
          );
        } catch (concatenateError) {
          console.error("Concatenation error:", concatenateError);
          toast.error(
            "Files uploaded but concatenation failed. Please try again."
          );
        }
      } else {
        toast.success("File uploaded successfully!");
      }

      setFiles([]);
      setUploadProgress([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-4 flex items-center justify-center">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="h-40 bg-cover bg-center"></div>
          <div className="p-6">
            <h2 className="text-2xl font-serif text-amber-800 mb-4">
              Upload Your Media
            </h2>
            <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors duration-300">
              <input
                type="file"
                accept={allowedFormats.join(",")}
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
                disabled={uploading}
              />
              <label
                htmlFor="fileInput"
                className={`cursor-pointer inline-block px-6 py-3 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Select Audio & Video Files
              </label>
              <p className="mt-2 text-amber-700">or drag and drop files here</p>
            </div>
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Selected Files:
                </h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-amber-50 p-3 rounded-md"
                    >
                      <div className="flex items-center">
                        {file.type.startsWith("audio/") ? (
                          <Music className="text-amber-600 mr-2" />
                        ) : (
                          <Video className="text-amber-600 mr-2" />
                        )}
                        <span className="text-amber-800 truncate">
                          {file.name}
                        </span>
                      </div>
                      {!uploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {files.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-4 px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" />
                    Uploading...
                  </span>
                ) : (
                  "Upload Files"
                )}
              </button>
            )}
          </div>
        </div>
        {concatenatedUrl && duration !== null && audioPath &&(
          <div className="mt-4 text-center">
            <a
              href={`/editor?videoUrl=${encodeURIComponent(
                concatenatedUrl
              )}&duration=${duration}&audioPath=${encodeURIComponent(audioPath)}`}
              className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 inline-block"
            >
              Proceed to Editor
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaUpload;

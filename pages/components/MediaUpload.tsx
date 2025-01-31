"use client";

import React, { useState, type ChangeEvent } from "react";
import { Music, Video, X, Loader2 } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const { user, isLoading } = useUser();
  const email = user?.email;

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
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
      setUploadProgress(new Array(e.target.files.length).fill(0));
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
      const response = await fetch(`/api/upload?email=${email}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const { fileUrls } = await response.json();
      console.log("Uploaded files:", fileUrls);

      // Clear files after successful upload
      setFiles([]);
      setUploadProgress([]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-4 flex items-center justify-center">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div
            className="h-40 bg-cover bg-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=160&width=640')",
            }}
          ></div>
          <div className="p-6">
            <h2 className="text-2xl font-serif text-amber-800 mb-4">
              Upload Your Media
            </h2>
            <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors duration-300">
              <input
                type="file"
                accept="audio/*,video/*"
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
      </div>
    </div>
  );
}

export default MediaUpload;

"use client";

import React, { useState, type ChangeEvent, useEffect } from "react";
import { Music, Video, X, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "react-hot-toast";
import { useMediaLoader } from "./hooks/useMediaLoader";
import Router from "next/router";
import CustomLoader from "./CustomLoader";
function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const { user, isLoading } = useUser();
  const email = user?.email;
  const [concatenatedUrl, setConcatenatedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [fileDurations, setFileDurations] = useState<number[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const MAX_DURATION_MINUTES = 20;

  const getFileDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const element = file.type.startsWith("audio/")
        ? document.createElement("audio")
        : document.createElement("video");

      element.preload = "metadata";

      element.onloadedmetadata = () => {
        window.URL.revokeObjectURL(element.src);
        resolve(element.duration);
      };

      element.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const newTotal = fileDurations.reduce((sum, duration) => sum + duration, 0);
    setTotalDuration(newTotal);
  }, [fileDurations]);

  const allowedFormats = [
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
    "video/mpeg",
    "video/webm",
  ];
  const { decodedUrl } = useMediaLoader(user.email);

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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        allowedFormats.includes(file.type)
      );

      if (validFiles.length !== e.target.files.length) {
        toast.error(
          "Invalid file format. Please upload MP3, MP4, or other major audio/video formats."
        );
      }

      const durations = await Promise.all(
        validFiles.map((file) => getFileDuration(file))
      );

      const newTotalDuration = [...fileDurations, ...durations].reduce(
        (sum, duration) => sum + duration,
        0
      );

      if (newTotalDuration > MAX_DURATION_MINUTES * 60) {
        toast.error(
          `Total duration exceeds ${MAX_DURATION_MINUTES} minutes limit. Please remove some files.`
        );
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setFileDurations((prevDurations) => [...prevDurations, ...durations]);
      setUploadProgress(new Array(validFiles.length).fill(0));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileDurations(fileDurations.filter((_, i) => i !== index));
    setUploadProgress(uploadProgress.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    // Initialize progress tracking for each file
    setUploadProgress(files.map(() => 0));
  
    try {
      // For client-side progress tracking, we need to use XMLHttpRequest instead of fetch
      const uploadWithProgress = () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          
          files.forEach((file, index) => {
            formData.append("file", file);
          });
  
          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              // Calculate overall progress percentage across all files
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress(prev => {
                const newProgress = [...prev];
                // Update progress for all files with the same percentage for simplicity
                return newProgress.map(() => percentComplete);
              });
            }
          };
  
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error("Invalid JSON response"));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.message || "Upload failed"));
              } catch {
                reject(new Error("Server error, please try again."));
              }
            }
          };
  
          xhr.onerror = () => reject(new Error("Network error"));
          
          xhr.open("POST", `/api/cart/upload_media?email=${email}`);
          xhr.send(formData);
        });
      };
  
      // Execute the upload with progress tracking
      const data = await uploadWithProgress();
  
      // Only concatenate if there are multiple videos
      if (data.fileUrls && data.fileUrls.length > 1) {
        setUploading(true); // Keep loading state for concatenation
        
        // Update UI to show concatenation is in progress
        toast.info("Files uploaded. Now combining the videos...");
        
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
          toast.success("Media uploaded & combined successfully!");
  
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
        // Single file case - display the duration and other details returned from the API
        setDuration(data.duration || 0);
        setAudioPath(data.audioPath || null);
        toast.success("File uploaded successfully!");
      }
  
      setFiles([]);
      setFileDurations([]);
      setTotalDuration(0);
      setUploadProgress([]);
      Router.push("/editor");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload files: ${error.message}`);
      setUploadProgress([]);
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isDurationExceeded = totalDuration > MAX_DURATION_MINUTES * 60;

  return (
    <div>
      {uploading ? (
        <CustomLoader />
      ) : (
        <div className="pt-4 flex items-center justify-center">
          <div className="w-full">
            {!decodedUrl ? (
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="h-40 bg-cover bg-center"></div>
                <div className="p-6">
                  <h2 className="text-2xl font-serif text-amber-800 mb-4">
                    Upload Your Media (If you haven't alredy)
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
                    <p className="mt-2 text-amber-700">
                      or drag and drop files here
                    </p>
                    <p className="text-red-700 text-xs">
                      *Your files can have a total duration upto 20 minutes
                    </p>
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
                              {fileDurations[index] && (
                                <span className="ml-2 text-amber-600 text-sm">
                                  ({formatDuration(fileDurations[index])})
                                </span>
                              )}
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

                      {/* Total duration indicator */}
                      <div className="mt-3 flex items-center">
                        <span className="text-amber-800 font-medium">
                          Total Duration: {formatDuration(totalDuration)}
                        </span>
                        {isDurationExceeded && (
                          <div className="ml-2 flex items-center text-red-600">
                            <AlertCircle size={16} className="mr-1" />
                            <span>
                              Exceeds {MAX_DURATION_MINUTES} minute limit
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {files.length > 0 && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading || isDurationExceeded}
                      className={`mt-4 px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 ${
                        uploading || isDurationExceeded
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title={
                        isDurationExceeded
                          ? `Maximum duration is ${MAX_DURATION_MINUTES} minutes`
                          : ""
                      }
                    >
                      {uploading ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin mr-2" />
                          Uploading...
                        </span>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <a
                  href={`/editor`}
                  className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 inline-block"
                >
                  Proceed to Editor
                </a>
              </div>
            )}
            {concatenatedUrl && duration !== null && audioPath && (
              <div className="mt-4 text-center">
                <a
                  href={`/editor?videoUrl=${encodeURIComponent(
                    concatenatedUrl
                  )}&duration=${duration}&audioPath=${encodeURIComponent(
                    audioPath
                  )}`}
                  className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors duration-300 inline-block"
                >
                  Proceed to Editor
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUpload;

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";

function Editor({ user }: { user: any }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const email = user.email;

  const handleUpload = async () => {
    if (!files) {
      alert("Please select files.");
      return;
    }

    setUploading(true);
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await fetch(
          `/api/cart/upload_items?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.audioUrl) {
          urls.push(data.audioUrl);
        } else {
          console.error("Failed to upload file:", data.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setAudioUrls(urls);
    setUploading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
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

        <div className="mt-6">
          <h2 className="text-lg font-bold">Extracted Audio URLs:</h2>
          <ul className="list-disc mt-2">
            {audioUrls.map((url, index) => (
              <li key={index}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();

export default Editor;

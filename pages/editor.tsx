"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditorDisplay from "./components/EditorDisplay";
import { EditHistoryProvider } from "./context/EditHistoryContext";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

function Editor() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("videoUrl");
  const duration = searchParams.get("duration");
  const audioPath = searchParams.get("audioPath");
  const { user, isLoading } = useUser();
  const email = user?.email;
  const router = useRouter();

  const handleDelete = async () => {
    console.log(videoUrl);
    if (!email || !videoUrl) {
      console.log("No email or videoUrl");
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
        router.push("/"); // Redirect after deletion
      } else {
        alert(data.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while deleting the file");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ position: "relative" }}>
        <button
          onClick={handleDelete}
          className="absolute top-[10px] right-[10px] px-3 py-2 bg-black text-white border-none cursor-pointer rounded-full"
        >
          X
        </button>
        <EditHistoryProvider>
          <EditorDisplay
            videoUrl={videoUrl}
            duration={duration}
            audioPath={audioPath}
          />
        </EditHistoryProvider>
      </div>
      <Footer />
    </div>
  );
}

export default Editor;

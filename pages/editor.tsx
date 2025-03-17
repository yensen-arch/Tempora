"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditorDisplay from "./components/EditorDisplay";
import { EditHistoryProvider } from "./context/EditHistoryContext";

function Editor() {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get("videoUrl");
  const duration = searchParams.get("duration");
  const audioPath = searchParams.get("audioPath");

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user ) {
        router.push("/api/auth/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, videoUrl, router]);

  if (isLoading || !isAuthorized) return null; // Prevent UI flickering

  return (
    <div>
      <Navbar />
      <EditHistoryProvider>
        <EditorDisplay
          videoUrl={videoUrl}
          duration={duration}
          audioPath={audioPath}
        />
      </EditHistoryProvider>
      <Footer />
    </div>
  );
}

export default Editor;

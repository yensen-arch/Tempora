"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditorDisplay from "./components/EditorDisplay";

function Editor() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("videoUrl");
  const duration = searchParams.get("duration");
  const audioPath = searchParams.get("audioPath");

  return (
    <div>
      <Navbar />
      <EditorDisplay videoUrl={videoUrl} duration={duration} audioPath = {audioPath}/>
      <Footer />
    </div>
  );
}

export default Editor;

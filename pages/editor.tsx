"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditorDisplay from "./components/EditorDisplay";

function Editor() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("videoUrl");

  return (
    <div>
      <Navbar />
      <EditorDisplay videoUrl={videoUrl} />
      <Footer />
    </div>
  );
}

export default Editor;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import localFont from "next/font/local";

const engraversFont = localFont({
  src: "../../fonts/engravers_gothic_regular-webfont.woff",
});

export default function CarouselWithAudioToggle() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Start muted
      videoRef.current.play(); // Autoplay video
    }
  }, []);

  return (
    <div className="relative w-full h-[600px] overflow-hidden flex">
      {/* Left Section */}
      <div className="w-[30%] p-8 bg-gradient-to-r from-gray-700 to-gray-300 flex flex-col justify-center z-10">
        <h2
          className="text-4xl font-bold text-white mb-4"
          style={{
            fontFamily: engraversFont.style.fontFamily,
          }}
        >
          Savour the Seasons of Life
        </h2>
        <p className="text-xl text-gray-200 mb-8">Through Tempora</p>
        {/* Play/Pause Button */}
        <button
          onClick={toggleAudio}
          className="bg-black/50 hover:bg-black/70 text-white p-4 rounded-full flex items-center justify-center transition"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Video Section */}
      <div className="absolute right-0 w-[70%] h-full">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/doubgqqme/video/upload/v1742887182/CarouselVideo_fvw8uy_ra85yv.mp4"
          className="w-full h-full object-cover"
          loop
          playsInline
        />
      </div>
    </div>
  );
}

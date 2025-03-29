"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Memories() {
  const { user, isLoading } = useUser();
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideshowRef = useRef(null);

  // Sample memory images for the slideshow
  const memoryImages = [
    "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
    "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
    "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
    "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
    "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % memoryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [memoryImages.length]);

  // Scroll to current slide
  useEffect(() => {
    if (slideshowRef.current) {
      const slideElements =
        slideshowRef.current.querySelectorAll(".memory-slide");
      if (slideElements[currentSlide]) {
        slideElements[currentSlide].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentSlide]);

  useEffect(() => {
    if (user?.email) {
      setLoadingAudio(true);
      fetch("/api/orders/get_user_audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAudioUrl(data.mediaUrl);
          }
        })
        .catch((err) => console.error("Error fetching audio:", err))
        .finally(() => setLoadingAudio(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f0]">
      <Navbar productsRef={undefined} />
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-serif text-[#5c4a38] text-center mb-2">
          Your Memories
        </h1>
        <p className="text-center text-[#8a7968] mb-12 font-serif italic">
          Cherished moments preserved in time
        </p>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          {/* Left column - Audio memories */}
          <div className="w-full md:w-1/2">
            <div className="bg-white border border-[#d3c5b0] rounded-lg shadow-md overflow-hidden h-full">
              <div className="bg-[#efe8dd] border-b border-[#d3c5b0] px-6 py-5">
                <h2 className="text-2xl font-serif text-[#5c4a38]">
                  {isLoading
                    ? "Loading..."
                    : user
                    ? `Welcome, ${user.name}`
                    : "Your Audio Memories"}
                </h2>
                <p className="text-[#8a7968]">
                  {user
                    ? "Listen to your preserved memories below"
                    : "Please log in to access your memories"}
                </p>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d3c5b0] border-t-[#5c4a38] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#8a7968] font-serif">
                      Loading your profile...
                    </p>
                  </div>
                ) : user ? (
                  <>
                    {loadingAudio ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-[#d3c5b0] border-t-[#5c4a38] rounded-full animate-spin mb-4"></div>
                        <p className="text-[#8a7968] font-serif">
                          Retrieving your memories...
                        </p>
                      </div>
                    ) : audioUrl ? (
                      <div className="bg-[#f8f5f0] border border-[#d3c5b0] rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-[#5c4a38] h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-[#f8f5f0]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-serif text-[#5c4a38] text-lg">
                              Your Audio Memory
                            </h3>
                            <p className="text-sm text-[#8a7968]">
                              Recorded and preserved for you
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-[#d3c5b0] w-full my-4"></div>

                        <div className="audio-player-container">
                          <audio
                            controls
                            className="w-full custom-audio-player"
                          >
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio tag.
                          </audio>
                        </div>

                        <div className="mt-6 p-4 bg-[#efe8dd] rounded-lg border border-[#d3c5b0]">
                          <p className="text-[#5c4a38] font-serif italic text-sm">
                            "Memories are timeless treasures of the heart. This
                            recording captures a moment that will forever be
                            part of your story."
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#f8f5f0] border border-[#d3c5b0] mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-[#8a7968]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-serif text-[#5c4a38] mb-2">
                          No Memories Found
                        </h3>
                        <p className="text-[#8a7968] mb-6">
                          You don't have any audio memories yet.
                        </p>
                        <button className="bg-[#5c4a38] hover:bg-[#4a3a2a] text-white font-serif px-6 py-2 rounded-md transition-colors duration-200">
                          Create Your First Memory
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#f8f5f0] border border-[#d3c5b0] mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-[#8a7968]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-serif text-[#5c4a38] mb-2">
                      Please Log In
                    </h3>
                    <p className="text-[#8a7968] mb-6">
                      Sign in to access your audio memories
                    </p>
                    <button
                      onClick={() => {
                        window.location.href = "/api/auth/login";
                      }}
                      className="bg-[#5c4a38] hover:bg-[#4a3a2a] text-white font-serif px-6 py-2 rounded-md transition-colors duration-200"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Vertical slideshow */}
          <div className="w-full md:w-1/2">
            <div className="bg-white border border-[#d3c5b0] rounded-lg shadow-md overflow-hidden h-full">
              <div className="bg-[#efe8dd] border-b border-[#d3c5b0] px-6 py-5">
                <h2 className="text-2xl font-serif text-[#5c4a38]">
                  Memory Gallery
                </h2>
                <p className="text-[#8a7968]">A visual journey through time</p>
              </div>

              <div className="p-6">
                <div className="relative">
                  {/* Decorative elements */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#d3c5b0] -translate-x-1/2 z-0"></div>
                  <div className="absolute left-1/2 top-0 w-4 h-4 rounded-full bg-[#5c4a38] -translate-x-1/2 -translate-y-1/2 z-10"></div>
                  <div className="absolute left-1/2 bottom-0 w-4 h-4 rounded-full bg-[#5c4a38] -translate-x-1/2 translate-y-1/2 z-10"></div>

                  {/* Vertical slideshow */}
                  <div
                    ref={slideshowRef}
                    className="relative max-h-[500px] overflow-y-auto hide-scrollbar py-8 px-4"
                  >
                    {memoryImages.map((src, index) => (
                      <div
                        key={index}
                        className={`memory-slide relative mb-12 transition-all duration-500 ${
                          currentSlide === index
                            ? "opacity-100 scale-100"
                            : "opacity-60 scale-95"
                        }`}
                      >
                        {/* Memory frame */}
                        <div
                          className={`
                            relative mx-auto max-w-xs transform transition-transform duration-500
                            ${index % 2 === 0 ? "ml-8" : "mr-8 translate-x-8"}
                          `}
                          onClick={() => setCurrentSlide(index)}
                        >
                          <div className="absolute inset-0 border-8 border-[#8a7968] rounded-lg shadow-lg"></div>
                          <div className="p-2">
                            <div className="relative overflow-hidden rounded-sm">
                              <img
                                src={src || "/placeholder.svg"}
                                alt={`Memory ${index + 1}`}
                                className="w-full h-auto object-cover"
                              />
                              <div className="absolute inset-0 bg-[#5c4a38]/10"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slideshow controls */}
                <div className="flex justify-center mt-6 space-x-2">
                  {memoryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                        currentSlide === index ? "bg-[#5c4a38]" : "bg-[#d3c5b0]"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Global styles */}

      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Custom audio player styling */
        .custom-audio-player {
          border-radius: 0.5rem;
          background-color: #efe8dd;
        }

        audio::-webkit-media-controls-panel {
          background-color: #efe8dd;
        }

        audio::-webkit-media-controls-play-button {
          background-color: #5c4a38;
          border-radius: 50%;
        }

        audio::-webkit-media-controls-timeline {
          background-color: #d3c5b0;
          border-radius: 25px;
          margin-left: 10px;
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
}

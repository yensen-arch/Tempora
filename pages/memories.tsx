import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Memories() {
  const { user, isLoading } = useUser();
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="bg-white h-screen flex flex-col justify-center items-center">
        {user ? (
          <>
            <p>Welcome, {user.name}!</p>
            {loadingAudio && <p>Loading audio...</p>}
            {audioUrl ? (
              <audio controls>
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            ) : (
              !loadingAudio && <p>No Memories found.</p>
            )}
          </>
        ) : (
          <p>Please log in to view memories.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Memories;

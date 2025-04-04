// hooks/useMediaLoader.ts
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEditHistoryContext } from '../context/EditHistoryContext';

export const useMediaLoader = (email?: string) => {
  const router = useRouter();
  const { videoUrl, audioPath: audioUrl } = router.query;
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedAudioUrl, setDecodedAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setEditHistoryFromApi } = useEditHistoryContext();

  useEffect(() => {
    if (!videoUrl || !audioUrl) {
      if (!email) return;
      
      setIsLoading(true);
      setError(null);
      
      fetch("/api/cart/get_uploaded_media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            console.warn(`HTTP ${res.status}: ${errorText}`);
            setError(`Failed to load media: ${res.status}`);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            if (data.fileUrl) {
              setDecodedUrl(decodeURIComponent(data.fileUrl));
              setDecodedAudioUrl(decodeURIComponent(data.audioPath));

              if(data.editHistory && Array.isArray(data.editHistory)){
                setEditHistoryFromApi(data.editHistory);
              }
            } else {
              setError("Please upload your media file");
            }
          } else {
            setError("No media data returned");
          }
        })
        .catch(err => {
          console.error("Error fetching media:", err);
          setError("Failed to load media");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDecodedUrl(videoUrl as string);
      setDecodedAudioUrl(audioUrl as string);
    }
  }, [email, videoUrl, audioUrl]);
  
  return {
    decodedUrl,
    decodedAudioUrl,
    isLoading,
    error
  };
};
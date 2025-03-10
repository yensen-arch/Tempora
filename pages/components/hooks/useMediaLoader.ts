// hooks/useMediaLoader.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEditHistoryContext } from '@/pages/context/EditHistoryContext';

export const useMediaLoader = (email?: string) => {
  const router = useRouter();
  const { videoUrl, audioPath: audioUrl } = router.query;
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedAudioUrl, setDecodedAudioUrl] = useState<string | null>(null);
  const { setEditHistoryFromApi } = useEditHistoryContext();

  useEffect(() => {
    if (!videoUrl || !audioUrl) {
      if (!email) return;
      
      fetch("/api/cart/get_uploaded_media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            console.warn(`HTTP ${res.status}: ${errorText}`);
            return;
          }
          return res.json();
        })
        .then((data) => {
          if(data){
            if (data.fileUrl) {
              setDecodedUrl(decodeURIComponent(data.fileUrl));
              setDecodedAudioUrl(decodeURIComponent(data.audioPath));

              if(data.editHistory && Array.isArray(data.editHistory)){
                setEditHistoryFromApi(data.editHistory);
              }
            }
          } else {
            return;
          }
        });
    } else {
      setDecodedUrl(videoUrl as string);
      setDecodedAudioUrl(audioUrl as string);
    }
  }, [email, videoUrl, audioUrl]);
  return {
    decodedUrl,
    decodedAudioUrl
  };
};
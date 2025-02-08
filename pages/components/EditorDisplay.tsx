import React from "react";

function EditorDisplay({ videoUrl }) {
  return (
    <div className="flex flex-col items-center p-4">
      {videoUrl ? (
        <video controls className="w-full max-w-3xl">
          <source src={decodeURIComponent(videoUrl)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>No video URL provided.</p>
      )}
    </div>
  );
}

export default EditorDisplay;

import React from "react";

interface EditedVideoSectionProps {
  src: string;
}

const EditedVideoSection: React.FC<EditedVideoSectionProps> = ({ src }) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">Edited Video</h3>
      <video
        src={src}
        controls
        className="w-full max-h-[400px] object-contain"
      />
      <a
        href={src}
        download="edited-video.mp4"
        className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Download Edited Video
      </a>
    </div>
  );
};

export default EditedVideoSection;


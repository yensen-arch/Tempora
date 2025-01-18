import React from "react";

interface TrimButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

const TrimButton: React.FC<TrimButtonProps> = ({
  onClick,
  loading,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center">Processing...</span>
      ) : (
        <span className="flex items-center justify-center">Trim Video</span>
      )}
    </button>
  );
};

export default TrimButton;

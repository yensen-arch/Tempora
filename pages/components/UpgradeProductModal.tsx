import React from 'react';
import { X } from 'lucide-react';

interface UpgradeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productMinutes: number;
  audioDuration: number;
  onSwitchProduct: () => void;
  onBrowseProducts: () => void;
}

const UpgradeProductModal: React.FC<UpgradeProductModalProps> = ({
  isOpen,
  onClose,
  productMinutes,
  audioDuration,
  onSwitchProduct,
  onBrowseProducts
}) => {
  if (!isOpen) return null;

  // Convert seconds to minutes with 1 decimal place
  const audioMinutes = (audioDuration / 60).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Duration Warning</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Your audio is <span className="font-bold">{audioMinutes} minutes</span> long, but your 
            selected product only supports up to <span className="font-bold">{productMinutes} minutes</span>.
          </p>
          <p className="text-gray-700">
            Would you like us to switch you to a larger product or would you like to browse yourself(while we save your progress)?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onBrowseProducts}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Browse Products
          </button>
          <button
            onClick={onSwitchProduct}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Switch to Larger Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeProductModal;
// components/UpdateOrderModal.tsx
import React, { useRef, useEffect, useState } from 'react';

interface Order {
  _id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  name: string;
}

interface UpdateOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newStatus: string) => Promise<void>;
}

const UpdateOrderModal: React.FC<UpdateOrderModalProps> = ({ 
  order, 
  isOpen, 
  onClose,
  onUpdate
}) => {
  const [status, setStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);
    
    try {
      console.log(status)
      await onUpdate(status);
      onClose();
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-800">Update Order Status</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              disabled={updating}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4">
            <p className="text-gray-600">
              Order: <span className="font-medium text-gray-800">{order._id.substring(0, 8)}...</span>
            </p>
            <p className="text-gray-600">
              Customer: <span className="font-medium text-gray-800">{order.name}</span>
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={updating}
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none flex items-center"
                disabled={updating}
              >
                {updating && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderModal;
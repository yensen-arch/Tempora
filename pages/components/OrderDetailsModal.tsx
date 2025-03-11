import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

interface Order {
  _id: string;
  fileUrl: string;
  name: string;
  address: string;
  email: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  products: Product[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  isOpen, 
  onClose 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p className="text-gray-600">Order ID:</p>
                  <p className="text-gray-900">{order._id}</p>
                  
                  <p className="text-gray-600">Date:</p>
                  <p className="text-gray-900">{format(new Date(order.createdAt), 'PPP')}</p>
                  
                  <p className="text-gray-600">Status:</p>
                  <p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </p>
                  
                  <p className="text-gray-600">Total Amount:</p>
                  <p className="text-gray-900 font-semibold">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p className="text-gray-600">Name:</p>
                  <p className="text-gray-900">{order.name}</p>
                  
                  <p className="text-gray-600">Email:</p>
                  <p className="text-gray-900">{order.email}</p>
                  
                  <p className="text-gray-600">Phone:</p>
                  <p className="text-gray-900">{order.contactNumber}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Shipping Address</h3>
                <div className="mt-2">
                  <p className="text-gray-900">{order.address}</p>
                  <p className="text-gray-900">{order.city}, {order.state} {order.zipcode}</p>
                </div>
              </div>
            </div>

            {/* Audio File & Products */}
            <div className="space-y-4">
              {/* Audio File */}
              <div>
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Audio File</h3>
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={order.fileUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-2">
                    <a 
                      href={order.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Download Audio File
                    </a>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Products</h3>
                <div className="mt-2">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="pb-2">Product</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products && order.products.map((product, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 text-gray-900">{product.name}</td>
                          <td className="py-2 text-gray-600">${product.cost.toFixed(2)}</td>
                          <td className="py-2 text-gray-600">{product.quantity}</td>
                          <td className="py-2 text-gray-900 text-right">${(product.cost * product.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-semibold">
                        <td colSpan={3} className="py-2">Total</td>
                        <td className="py-2 text-right">${order.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
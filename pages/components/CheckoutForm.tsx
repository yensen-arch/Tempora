import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ products, onCheckout }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', address: '', phoneNumber: '',
    city: '', state: '', zipCode: '', cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + parseFloat(product.cost), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);
    console.log(cardElement)
    
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: formData.cardName,
        email: formData.email,
        address: { city: formData.city, line1: formData.address, state: formData.state, postal_code: formData.zipCode }
      }
    });

    if (error) {
      alert(error.message);
      setIsProcessing(false);
      return;
    }

    const orderData = {
      ...formData, products, totalAmount: calculateTotal(), paymentMethodId: paymentMethod.id
    };

    try {
      const response = await fetch('/api/orders/new_order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (response.ok) alert('Order placed successfully');
      else alert(data.error || 'Failed to place order');
    } catch (error) {
      console.error('Order submission error:', error);
    }
    setIsProcessing(false);
    onCheckout?.(formData);
  };

  return (
      <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" required className="w-full px-3 py-2 border rounded-md" />
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="ZIP Code" required className="w-full px-3 py-2 border rounded-md" />
          <input type="text" name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="Name on Card" required className="w-full px-3 py-2 border rounded-md" />
          <CardElement className="p-3 border rounded-md" />
          <div className="flex justify-between text-lg font-semibold"><span>Total:</span><span>${calculateTotal()}</span></div>
          <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
  );
};

export default CheckoutForm;
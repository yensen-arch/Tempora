import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';

const CheckoutForm = ({ products, onCheckout }) => {
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    address: '', 
    city: '', 
    state: '', 
    zipCode: '', 
    contactNumber: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + parseFloat(product.cost), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Create payment intent on the server
      const response = await fetch('/api/orders/payment_intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products,
          totalAmount: calculateTotal()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // 2. Confirm card payment with the client secret
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.cardName,
            email: formData.email,
            phone: formData.contactNumber,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode
            }
          }
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // 3. Payment successful - create order in your database
      if (paymentResult.paymentIntent.status === 'succeeded') {
        const orderResponse = await fetch('/api/orders/new_order', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({
            ...formData,
            products,
            totalAmount: calculateTotal(),
            paymentIntentId: paymentResult.paymentIntent.id,
            paymentStatus: 'completed'
          })
        });

        if (!orderResponse.ok) {
          const orderError = await orderResponse.json();
          console.warn('Order created but database record failed:', orderError);
          // Continue since payment succeeded
        }

        setPaymentSuccess(true);
        onCheckout?.(formData);
        
        // Redirect to success page after short delay
        setTimeout(() => {
          router.push('/order-confirmation?orderId=' + paymentResult.paymentIntent.id);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout Details</h2>
      
      {paymentSuccess ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          Payment successful! Redirecting to order confirmation...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              placeholder="First Name" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
            />
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              placeholder="Last Name" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
            />
          </div>
          
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            placeholder="Email" 
            required 
            className="w-full px-3 py-2 border rounded-md" 
          />
          
          <input 
            type="text" 
            name="contactNumber" 
            value={formData.contactNumber} 
            onChange={handleInputChange} 
            placeholder="Phone Number" 
            required 
            className="w-full px-3 py-2 border rounded-md" 
          />
          
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleInputChange} 
            placeholder="Address" 
            required 
            className="w-full px-3 py-2 border rounded-md" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleInputChange} 
              placeholder="City" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
            />
            <input 
              type="text" 
              name="state" 
              value={formData.state} 
              onChange={handleInputChange} 
              placeholder="State" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
            />
            <input 
              type="text" 
              name="zipCode" 
              value={formData.zipCode} 
              onChange={handleInputChange} 
              placeholder="ZIP Code" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
            />
          </div>
          
          <hr className="my-4" />
          
          <h3 className="text-lg font-semibold">Payment Information</h3>
          <input 
            type="text" 
            name="cardName" 
            value={formData.cardName} 
            onChange={handleInputChange} 
            placeholder="Name on Card" 
            required 
            className="w-full px-3 py-2 border rounded-md" 
          />
          
          <div className="border rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
          
          {paymentError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md">
              {paymentError}
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold mt-6">
            <span>Total:</span>
            <span>${calculateTotal()}</span>
          </div>
          
          <button 
            type="submit" 
            disabled={isProcessing || !stripe} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
          >
            {isProcessing ? 'Processing Payment...' : 'Complete Purchase'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckoutForm;
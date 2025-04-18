"use client";
import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import toast from "react-hot-toast";

const PromotionConsentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Promotion Consent</h2>
        <p className="mt-2 text-gray-600">
          By agreeing, you allow us to use your audio for promotional purposes.
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutForm = ({ products, onCheckout }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    promotionConsent: false,
    zipCode: "",
    referralCode: "",
    contactNumber: "",
    cardName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isCodeapplied, setIsCodeApplied] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useUser();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        email: user.email || "",
        firstName: (user.given_name as string) || "",
        lastName: (user.family_name as string) || ""
      }));
    }
  }, [user]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing again
    setPaymentError(null);
    setErrorDetails(null);
  };

  const calculateTotal = () => {
    const t = (products || [])
      .reduce((sum: number, product:any) => sum + parseFloat(product.cost), 0)
      .toFixed(2);
    setTotal(t);
  };

  const applyDiscount = (discount: number) =>{
    const discountedTotal = total - total*(discount/100);
    setTotal(Number(discountedTotal.toFixed(2)));
  }

  useEffect(() => {
    calculateTotal();
  }, [products]);

  const checkCodeValidity = async (code: string) => {
    try {
      const response = await fetch("/api/referrals/check-code-validity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        toast.error((await response.json()).error);
        return;
      }

      const data = await response.json();
      applyDiscount(data.discount);
      setIsCodeApplied(true);
      toast.success(data.message);
      return data;
    } catch (error) {
      console.error("Error checking referral code:", error);
      return null;
    }
  }
  const getErrorMessage = (error) => {
    // Extract useful information from different error types
    if (error.type === "card_error" || error.type === "validation_error") {
      return {
        message: error.message,
        details: error.code,
        help: getCardErrorHelp(error.code),
      };
    }

    if (error.status === 400) {
      return {
        message: "Invalid request data",
        details: error.error || "Please check your information and try again",
        help: "Make sure all required fields are filled correctly",
      };
    }

    if (error.status === 500) {
      return {
        message: "Server error",
        details: "Our payment system is experiencing issues",
        help: "Please try again in a few minutes or contact support",
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      details: error.toString(),
      help: "Please try again or use a different payment method",
    };
  };

  const getCardErrorHelp = (code) => {
    const helpMessages = {
      card_declined:
        "Your card was declined. Please use a different card or contact your bank.",
      expired_card: "Your card has expired. Please use a different card.",
      incorrect_cvc:
        "The security code (CVC) is incorrect. Please check the 3-digit code on the back of your card.",
      insufficient_funds:
        "Your card has insufficient funds. Please use a different card or add funds to this one.",
      invalid_expiry_date:
        "The expiration date is invalid. Please check the date format (MM/YY).",
      invalid_number:
        "The card number is invalid. Please check the number or try a different card.",
      processing_error:
        "An error occurred while processing your card. Please try again or use a different card.",
    };

    return helpMessages[code] || "Please check your card details and try again";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setPaymentError(
        "Payment system is initializing. Please try again in a moment."
      );
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setErrorDetails(null);

    try {
      // 1. Create payment intent on the server
      const response = await fetch("/api/orders/payment_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          products,
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorInfo = {
          status: response.status,
          error: errorData.error || "Failed to create payment intent",
        };
        throw errorInfo;
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
              postal_code: formData.zipCode,
            },
          },
        },
      });

      if (paymentResult.error) {
        throw paymentResult.error;
      }

      // 3. Payment successful - create order in your database
      if (paymentResult.paymentIntent.status === "succeeded") {
        try {
          const orderResponse = await fetch("/api/orders/new_order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              products,
              totalAmount: total,
              paymentIntentId: paymentResult.paymentIntent.id,
              paymentStatus: "completed",
            }),
          });

          if (!orderResponse.ok) {
            const orderError = await orderResponse.json();
            console.warn(
              "Order created but database record failed:",
              orderError
            );
            // Continue since payment succeeded, but notify user about partial success
            setPaymentSuccess(true);
            setPaymentError(
              "Your payment was successful, but we encountered an issue saving your order details. Our team has been notified and will contact you shortly."
            );

            // Still redirect after delay, but with a notification flag
            setTimeout(() => {
              router.push(
                "/order-confirmation?orderId=" +
                  paymentResult.paymentIntent.id +
                  "&orderStatus=partial"
              );
            }, 2000);
            return;
          }
        } catch (orderError) {
          // Handle order creation error, but still consider payment successful
          console.error("Order creation error:", orderError);
          setPaymentSuccess(true);
          setPaymentError(
            "Your payment was successful, but we encountered an issue saving your order details. Our team has been notified and will contact you shortly."
          );

          setTimeout(() => {
            router.push(
              "/order-confirmation?orderId=" +
                paymentResult.paymentIntent.id +
                "&orderStatus=partial"
            );
          }, 2000);
          return;
        }

        // Full success path
        setPaymentSuccess(true);
        onCheckout?.(formData);

        // Redirect to success page after short delay
        setTimeout(() => {
          router.push(
            "/order-confirmation?orderId=" + paymentResult.paymentIntent.id
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      const errorInfo = getErrorMessage(error);
      setPaymentError(errorInfo.message);
      setErrorDetails({
        details: errorInfo.details,
        help: errorInfo.help,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  // Render function should include error display component
  const renderErrorMessage = () => {
    if (!paymentError) return null;

    return (
      <div className="error-container p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 font-medium">{paymentError}</p>
        {errorDetails && (
          <div className="mt-2">
            <p className="text-sm text-red-500">{errorDetails.details}</p>
            <p className="text-sm text-gray-700 mt-1">{errorDetails.help}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
      <PromotionConsentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Checkout Details
      </h2>

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
            disabled={true}
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
            placeholder="Phone Number with Country Code"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              disabled={isCodeapplied}
              name="referralCode"
              value={formData.referralCode}
              onChange={handleInputChange}
              placeholder="Referral Code (optional)"
              className="w-full px-3 py-2 border rounded-md"
            />
            {!isCodeapplied? (
              <button
              type="button"
              onClick={() => checkCodeValidity(formData.referralCode)}
              className="w-full bg-green-400 hover:bg-gray-300 text-black py-2 px-4 rounded-md"
            >
              Apply Code
            </button>
            ):(
              <button
              type="button"
              onClick={() => {setIsCodeApplied(false); calculateTotal(); setFormData({...formData, referralCode: ""})}}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Reset Code
              </button>
            )}
            
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
          {/* Error message display */}
          {renderErrorMessage()}
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
            <span>${total}</span>
          </div>

          <div>
            <input type="checkbox" id="promotionConsent" name="promotionConsent"
              checked={formData.promotionConsent}
              onChange={(e) => setFormData({ ...formData, promotionConsent: e.target.checked })}
            />
            <label htmlFor="promotionConsent" className="ml-2 text-sm text-gray-600">
              I agree to use my audio for <span onClick={()=>setIsModalOpen(true)} className="underline">promotional purposes</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
          >
            {isProcessing ? "Processing Payment..." : "Complete Purchase"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckoutForm;

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order details if needed
    if (orderId) {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-xl">Loading order details...</div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">
              <p className="text-xl font-semibold">{error}</p>
              <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
                Return to home page
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You for Your Order!</h1>
              
              <p className="text-gray-600 mb-2">
                Your payment has been processed successfully.
              </p>
              
              <div className="bg-gray-50 rounded-md p-4 my-6">
                <p className="text-sm text-gray-500 mb-1">Order ID:</p>
                <p className="font-medium text-gray-800 break-all">{orderId}</p>
              </div>
              
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to your email address.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/memories"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Memories
                </Link>
                
                <Link 
                  href="/profile"
                  className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Order History
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import CheckoutForm from "./components/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export default function checkout() {
  const router = useRouter();
  const [product, setProduct] = useState([]);
  const { user, isLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const stripePromise = loadStripe("your-publishable-key-here");//will take on Sunday

  useEffect(() => {
    const productFromQuery = {
      id: router.query.id || "empty",
      name: router.query.name || "",
      image: router.query.image || "",
      cost: router.query.cost || "",
      minutes: router.query.minutes || "",
    };

    const fetchCartData = async () => {
      if (isLoading) return;

      setLoading(true);
      try {
        if (user) {
          let updatedCart = [];

          if (productFromQuery.id !== "empty") {
            const addProductResponse = await fetch("/api/cart/add_items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                product: productFromQuery,
              }),
            });

            if (!addProductResponse.ok) {
              throw new Error("Failed to add product from query to the cart");
            }
          }

          const response = await fetch("/api/cart/get_items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });

          if (!response.ok) throw new Error("Failed to fetch cart data");

          const cartData = await response.json();
          updatedCart = Array.isArray(cartData) ? cartData : [];

          setProduct(updatedCart);
        } else {
          const savedProduct = localStorage.getItem("cartProduct");
          const parsedProduct = savedProduct ? JSON.parse(savedProduct) : null;

          if (productFromQuery.id !== "empty") {
            localStorage.setItem(
              "cartProduct",
              JSON.stringify(productFromQuery)
            );
            setProduct(
              parsedProduct
                ? [parsedProduct, productFromQuery]
                : [productFromQuery]
            );
          } else {
            setProduct(parsedProduct ? [parsedProduct] : []);
          }
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [router.query, user, isLoading]);

  const handleCheckout = async () => {};

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }
  if (
    !product ||
    !Array.isArray(product) ||
    product.length === 0 ||
    product[0].id === "empty"
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-lg text-stone-600">No product in the cart.</h1>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-100">
      {/* Navbar */}
      <Navbar />
      {/* Main Content */}
      <div className="min-h-screen flex-grow py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {product.length > 0 ? (
            <>
              {product.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white shadow-md rounded-lg overflow-hidden mb-4"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between p-6">
                    {/* Product Image */}
                    <div className="w-28 h-28 flex-shrink-0 relative rounded-md overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 mx-8 flex-col md:flex-row items-center md:items-start justify-between md:ml-6 text-center md:text-left">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-stone-800">
                          {item.name}
                        </h2>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className="flex items-center justify-center md:justify-start">
                          <DollarSign className="h-5 w-5 text-stone-500 mr-1" />
                          <p className="text-md font-medium text-stone-700">
                            {item.cost}
                          </p>
                        </div>
                        <div className="flex items-center justify-center md:justify-start mt-2">
                          <Clock className="h-5 w-5 text-stone-500 mr-1" />
                          <p className="text-sm text-stone-600">
                            {item.minutes} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <Elements stripe={stripePromise}>
                <CheckoutForm products={product} onCheckout={handleCheckout} />
              </Elements>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-lg text-stone-600">
                No product in the cart.
              </h1>
              <Link href="/" className="mt-4 text-blue-500 hover:underline">
                Go back to products
              </Link>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center mt-6 text-stone-600 hover:text-stone-800 transition duration-300 ease-in-out"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

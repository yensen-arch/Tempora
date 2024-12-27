"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Cart() {
  const router = useRouter();
  const [product, setProduct] = useState([]);
  const { user, isLoading } = useUser();
  const hasFetchedData = useRef(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const productFromQuery = {
      id: router.query.id,
      name: router.query.name,
      image: router.query.image,
      cost: router.query.cost,
      minutes: router.query.minutes,
    };

    const fetchCartData = async () => {
      if (isLoading || hasFetchedData.current) return; // Wait for loading or skip if already fetched
      hasFetchedData.current = true; // Mark as fetched

      setLoading(true); // Set loading state
      try {
        if (user) {
          const response = await fetch("/api/cart/get_items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });

          if (!response.ok) throw new Error("Failed to fetch cart data");

          const cartData = await response.json();
          if (response.status === 201) {
            let updatedCart = cartData || [];
            if (productFromQuery.id) {
              const isAlreadyInCart = updatedCart.some(
                (item) => item.id === productFromQuery.id
              );
              if (!isAlreadyInCart) {
                updatedCart = [...updatedCart, productFromQuery];

                // Add the new product to the backend cart
                await fetch("/api/cart/add_items", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: user.email,
                    product: productFromQuery,
                  }),
                });
              }
            }
            setProduct(updatedCart);
          } else if (Array.isArray(cartData)) {
            const existingProduct = cartData.find(
              (item) => item?.id === productFromQuery?.id
            );
            if (!existingProduct && productFromQuery.id) {
              await fetch("/api/cart/add_items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  product: productFromQuery,
                }),
              });
              setProduct((prev) =>
                [...prev, productFromQuery].filter(
                  (item, index, arr) =>
                    arr.findIndex((i) => i.id === item.id) === index
                )
              );
            } else {
              setProduct(cartData);
            }
          }
          console.log(cartData);
        } else {
          if (productFromQuery.id) {
            localStorage.setItem(
              "cartProduct",
              JSON.stringify(productFromQuery)
            );
            setProduct([productFromQuery]);
          } else {
            const savedProduct = localStorage.getItem("cartProduct");
            if (savedProduct) setProduct([JSON.parse(savedProduct)]);
          }
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setLoading(false); // End loading state
      }
    };
    fetchCartData();
  }, [router.query, user, isLoading]);

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
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
            product.map((item) => (
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

                  {/* Checkout Button */}
                  <button className="bg-stone-800 text-white text-sm px-6 py-3 rounded-md hover:bg-stone-700 transition focus:outline-none mt-4 md:mt-0">
                    Edit
                  </button>
                </div>
              </motion.div>
            ))
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

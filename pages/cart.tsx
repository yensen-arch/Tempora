"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CloudCog,
  DollarSign,
  Edit3,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import MediaUpload from "./components/MediaUpload";
import { EditHistoryProvider } from "../lib/context/EditHistoryContext";
import localFont from "next/font/local";

const engraversFont = localFont({
  src: "../fonts/engravers_gothic_regular-webfont.woff",
});

export default function Cart() {
  const router = useRouter();
  const [product, setProduct] = useState([]);
  const { user, isLoading } = useUser();
  const hasFetchedData = useRef(false);
  const [loading, setLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    const productFromQuery = {
      id: router.query.id || "empty",
      name: router.query.name || "",
      image: router.query.image || "",
      cost: router.query.cost || "",
      minutes: router.query.minutes || "",
    };

    const fetchCartData = async () => {
      if (isLoading || hasFetchedData.current) return;
      hasFetchedData.current = true;
      setLoading(true);
      setMediaLoading(true);

      try {
        if (user) {
          let updatedCart = [];
          if (productFromQuery.id !== "empty") {
            const addProductResponse = await fetch("/api/cart/add_items", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
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
            headers: {
              "Content-Type": "application/json",
            },
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
        setMediaLoading(false);
      }
    };

    fetchCartData();
  }, [router.query, user, isLoading]);

  const handleDelete = async (productId?: string) => {
    try {
      if (user?.email) {
        // If user is logged in, delete from database
        const response = await fetch("/api/cart/delete_items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            productId: productId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete product from cart");
        }

        // Refetch cart data after successful deletion
        const cartResponse = await fetch("/api/cart/get_items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (!cartResponse.ok)
          throw new Error("Failed to fetch updated cart data");

        const cartData = await cartResponse.json();
        const updatedCart = Array.isArray(cartData) ? cartData : [];
        setProduct(updatedCart);
      } else {
        // If user is not logged in, remove from localStorage
        localStorage.removeItem("cartProduct");
        setProduct([]);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className=" h-screen text-center flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (
    !product ||
    !Array.isArray(product) ||
    product.length === 0 ||
    product[0].id === "empty"
  ) {
    return (
      <div>
        {" "}
        <Navbar productsRef={undefined} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1
            className="text-lg text-stone-600"
            style={{
              fontFamily: engraversFont.style.fontFamily,
            }}
          >
            No product in the cart.
          </h1>
          <Link
            href="/"
            className="mt-4 text-blue-500 hover:underline"
            style={{
              fontFamily: engraversFont.style.fontFamily,
            }}
          >
            Go back to products
          </Link>
        </div>{" "}
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-stone-100">
      {/* Navbar */}
      <Navbar productsRef={undefined} />
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
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 relative rounded-md overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between w-full gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <h2
                        className="text-lg sm:text-xl font-semibold text-stone-800 line-clamp-2"
                        style={{
                          fontFamily: engraversFont.style.fontFamily,
                        }}
                      >
                        {item.name}
                      </h2>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500 mr-1" />
                        <p className="text-sm sm:text-md font-medium text-stone-700">
                          {item.cost}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-stone-500 mr-1" />
                        <p className="text-xs sm:text-sm text-stone-600">
                          {item.minutes} minutes
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleDelete(item.productId);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1
                className="text-lg text-stone-600"
                style={{
                  fontFamily: engraversFont.style.fontFamily,
                }}
              >
                No product in the cart.
              </h1>
              <Link
                href="/"
                className="mt-4 text-blue-500 hover:underline"
                style={{
                  fontFamily: engraversFont.style.fontFamily,
                }}
              >
                Go back to products
              </Link>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center mt-6 text-stone-600 hover:text-stone-800 transition duration-300 ease-in-out"
            style={{
              fontFamily: engraversFont.style.fontFamily,
            }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </Link>
          <EditHistoryProvider>
            {mediaLoading ? (
              <div className="mt-8 bg-white rounded-lg shadow-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ) : (
              <MediaUpload />
            )}
          </EditHistoryProvider>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import MediaUpload from "./components/MediaUpload";
import { EditHistoryProvider } from "../lib/context/EditHistoryContext";

export default function Cart() {
  const router = useRouter();
  const [product, setProduct] = useState([]);
  const { user, isLoading } = useUser();
  const hasFetchedData = useRef(false);
  const [loading, setLoading] = useState(false);

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
      }
    };

    fetchCartData();
  }, [router.query, user, isLoading]);

  const handleDelete = async (productId?: string) => {
    try {
      const response = await fetch("/api/cart/delete_items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product from cart");
      }

      const updatedCart = product.filter(
        (item) => item.productId !== productId
      );
      setProduct(updatedCart);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading || isLoading) {
    return <div className=" h-screen text-center flex justify-center items-center"><p >Loading...</p></div>;
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
          <h1 className="text-lg text-stone-600">No product in the cart.</h1>
          <Link href="/" className="mt-4 text-blue-500 hover:underline">
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
                      <h2 className="text-lg sm:text-xl font-semibold text-stone-800 line-clamp-2">
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
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                    {/* Edit Button */}
                    <Link href="/editor" className="flex-1 sm:flex-auto">
                      <button className="w-full flex items-center justify-center gap-2 bg-stone-800 text-white text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-transparent hover:border-2 hover:border-black hover:text-black transition focus:outline-none">
                        <span>Edit</span>
                      </button>
                    </Link>

                    {/* Delete Button */}
                    <button
                      className="flex-1 sm:flex-auto w-full flex items-center justify-center gap-2 border border-gray-200 bg-white text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-gray-200 transition focus:outline-none"
                      onClick={() => handleDelete(item.productId)}
                    >
                      <Trash2 className="w-4 h-4 text-black" />
                    </button>
                  </div>
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
          <EditHistoryProvider>
            <MediaUpload />
          </EditHistoryProvider>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/get_available_products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product) => {
    // Navigate to /cart with query parameters
    const query = new URLSearchParams({
      id: product._id,
      name: product.name,
      image: product.image,
      cost: product.cost,
      minutes: product.minutes,
    }).toString();
    router.push(`/cart?${query}`);
  };

  return (
    <section className="py-12 bg-stone-100 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product._id || index}
              initial={mounted ? { opacity: 0, y: 50 } : false}
              animate={mounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 relative"
            >
              <div className="relative w-full h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-110"
                />
                {product.tags && product.tags.length > 0 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {product.tags[0]}
                  </div>
                )}
              </div>
              <div className="p-6 bg-white bg-opacity-90 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-stone-600 mb-4">
                  ${product.cost.toFixed(2)}
                </p>
                <button
                  onClick={() => handleSelectProduct(product)} // Handle product selection
                  className="w-full bg-stone-800 text-white py-2 px-4 rounded transition duration-300 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-opacity-50 flex items-center justify-center"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Select to Edit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-32 h-32 text-stone-200 opacity-20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M0 0 L50 50 L0 100 Z" />
        </svg>
        <svg
          className="absolute bottom-0 right-0 w-32 h-32 text-stone-200 opacity-20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M100 0 L50 50 L100 100 Z" />
        </svg>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const products = [
  {
    id: 1,
    name: "3 Minutes",
    price: "$299.99",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690697/v3_rdam3n.jpg",
    tag: "Sale!",
  },
  {
    id: 2,
    name: "6 Minutes",
    price: "$199.99",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690697/v3_rdam3n.jpg",
    tag: "10% off",
  },
  {
    id: 3,
    name: "10 Minutes",
    price: "$149.99",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690697/v3_rdam3n.jpg",
    tag: "New Arrival",
  },
];

export default function Products() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-12 bg-stone-100 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={mounted ? { opacity: 0, y: 50 } : false}
              animate={mounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: product.id * 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 relative"
            >
              <div className="relative w-full h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  layout="fill" // Ensure the image takes full container space
                  objectFit="cover" // Ensure the image covers the container while maintaining aspect ratio
                  className="transition-transform duration-300 hover:scale-110"
                />
                {product.tag && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {product.tag}
                  </div>
                )}
              </div>
              <div className="p-6 bg-white bg-opacity-90 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-stone-600 mb-4">{product.price}</p>
                <button
                  className="w-full bg-stone-800 text-white py-2 px-4 rounded transition duration-300 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-opacity-50 flex items-center justify-center"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Add to Cart
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

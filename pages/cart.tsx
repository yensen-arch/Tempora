"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Cart() {
  const router = useRouter();
  const { id, name, image, cost, minutes } = router.query;

  return (
    <div className=" flex flex-col bg-stone-100">
      {/* Navbar */}
      <Navbar />
      {/* Main Content */}
      <div className="min-h-screen flex-grow py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center justify-between p-6">
              {/* Product Image */}
              <div className="w-28 h-28 flex-shrink-0 relative rounded-md overflow-hidden">
                {image && (
                  <Image
                    src={image as string}
                    alt={name as string}
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
                    {name}
                  </h2>
               
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center justify-center md:justify-start">
                    <DollarSign className="h-5 w-5 text-stone-500 mr-1" />
                    <p className="text-md font-medium text-stone-700">{cost}</p>
                  </div>
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <Clock className="h-5 w-5 text-stone-500 mr-1" />
                    <p className="text-sm text-stone-600">{minutes} minutes</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="bg-stone-800 text-white text-sm px-6 py-3 rounded-md hover:bg-stone-700 transition focus:outline-none mt-4 md:mt-0">
                Edit 
              </button>
            </div>
          </motion.div>

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

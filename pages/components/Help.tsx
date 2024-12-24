"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    title: "Choose Your Products",
    description:
      "Choose the products you want to buy and add them to your cart.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684532/samples/cup-on-a-table.jpg",
    buttonText: "Start Shopping",
  },
  {
    title: "Edit Your Memories",
    description:
      "Upload your memories and edit them seamlessly through our Inbuilt editor.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684532/samples/coffee.jpg",
    buttonText: "Proceed to Editor",
  },
  {
    title: "Checkout",
    description:
      "Sit back and relax as we deliver your products right to your doorstep.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684527/samples/ecommerce/accessories-bag.jpg",
    buttonText: "Complete the Order",
  },
];

export default function Help() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Wondering How?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-6">
                <div className="relative h-48 mb-4">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {step.description}
                </p>
                <motion.button className="w-full py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all duration-300">
                  {step.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
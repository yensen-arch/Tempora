"use client";

import { motion } from "framer-motion";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";

const engraversFont = localFont({
  src: "../../fonts/engravers_gothic_regular-webfont.woff",
});

const steps = [
  {
    title: "Choose Your Products",
    description:
      "Choose the products you want to buy and add them to your cart.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684532/samples/cup-on-a-table.jpg",
  },
  {
    title: "Edit Your Memories",
    description:
      "Upload your memories and edit them seamlessly through our Inbuilt editor.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684532/samples/coffee.jpg",
  },
  {
    title: "Checkout",
    description:
      "Sit back and relax as we deliver your products right to your doorstep.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684527/samples/ecommerce/accessories-bag.jpg",
  },
];

export default function Help() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-serif text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: engraversFont.style.fontFamily,
          }}
        >
          In 3 Easy Steps !
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: -400 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-6">
                <div className="relative h-48 mb-4">
                  <Image
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
                <h3
                  className="text-xl font-semibold text-center mb-2"
                  style={{
                    fontFamily: engraversFont.style.fontFamily,
                  }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

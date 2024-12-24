"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  image: string;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Emma Thompson",
    image: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684529/samples/two-ladies.jpg",
    review:
      "Tempora has transformed my shopping experience. The elegance and quality of their products are unmatched. I particularly love their memory creation services - they've helped me capture some of the most precious moments of my life in the most beautiful way possible.",
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684529/samples/two-ladies.jpg",
    review:
      "I was skeptical at first, but Tempora has exceeded all my expectations. Their attention to detail and commitment to customer satisfaction is truly commendable. The products I've purchased have become cherished parts of my daily life.",
  },
  {
    id: 3,
    name: "Sophia Rodriguez",
    image: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734684529/samples/two-ladies.jpg",
    review:
      "Tempora isn't just a brand, it's an experience. From the moment you visit their website to the instant you receive your beautifully packaged product, every step is infused with elegance and care. I can't recommend them enough!",
  },
];

const TestimonialCard: React.FC<{
  testimonial: Testimonial;
  isExpanded: boolean;
  onClick: () => void;
}> = ({ testimonial, isExpanded, onClick }) => {
  return (
    <motion.div
      className={`rounded-lg shadow-xl p-6 flex flex-col items-center text-center ${
        isExpanded ? "scale-105" : "scale-100"
      } transition-transform duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src={testimonial.image}
        alt={testimonial.name}
        width={100}
        height={100}
        className="rounded-full border-2 border-gray-500 mb-4"
      />
      <h3 className="text-lg font-semibold text-black mb-1">
        {testimonial.name}
      </h3>
      <div className="flex mb-2">
        {[...Array(5)].map((_, index) => (
          <span key={index} className="text-amber-400 text-3xl">
            ★
          </span>
        ))}
      </div>
      <motion.div
        className="text-black text-sm relative overflow-hidden flex-grow"
        initial={{ height: "80px" }}
        animate={{ height: isExpanded ? "auto" : "80px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <p>{testimonial.review}</p>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
        )}
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.button
          key={isExpanded ? "less" : "more"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="mt-2 text-black transition-colors duration-300 flex items-center"
        >
          {isExpanded ? (
            <>
              View Less <ChevronUp className="ml-1 w-4 h-4" />
            </>
          ) : (
            <>
              View More <ChevronDown className="ml-1 w-4 h-4" />
            </>
          )}
        </motion.button>
      </AnimatePresence>
    </motion.div>
  );
};

const Testimonials: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-serif italic text-center text-black mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          What Our Customers Say
        </motion.h2>
        <motion.p
          className="text-black text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Discover the experiences of those who have embraced Tempora
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id}>
              <TestimonialCard
                testimonial={testimonial}
                isExpanded={expandedId === testimonial.id}
                onClick={() =>
                  setExpandedId(
                    expandedId === testimonial.id ? null : testimonial.id
                  )
                }
              />
            </div>
          ))}
        </div>
        <motion.p
          className="text-black text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Join other satisfied customers and experience the Tempora
          difference today.
        </motion.p>
      </div>
    </section>
  );
};

export default Testimonials;
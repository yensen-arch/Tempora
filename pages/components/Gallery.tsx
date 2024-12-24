"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  {
    title: "A Perfect Gift",
    subtitle: "%10 DISCOUNT",
    url: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690530/v1_lonfrm.jpg",
  },
  {
    title: "The Seasons of Life",
    url: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690612/v2_e7izqn.jpg",
  },
  {
    title: "Memories That Last Forever",
    url: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690697/v3_rdam3n.jpg",
  },
  {
    title: "The TEMPORA Life",
    url: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690756/v4_mzebep.jpg",
  },
  {
    title: "FLORALS",
    url: "https://res.cloudinary.com/dqh2tacov/image/upload/v1734690928/v6_u0snfi.jpg",
  },
];

export default function Gallery() {
  const [currentImages, setCurrentImages] = useState(images.slice(0, 4));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsResponsive(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImages((prevImages) => {
        const newImages = [...images];
        return prevImages.map(() => {
          const randomIndex = Math.floor(Math.random() * newImages.length);
          const [newImage] = newImages.splice(randomIndex, 1);
          return newImage;
        });
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 auto-rows-[200px] md:auto-rows-[300px]">
        {currentImages
          .slice(0, isResponsive ? 3 : currentImages.length)
          .map((image, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-lg 
              ${
                index === 0
                  ? "md:col-span-3 md:row-span-2 col-span-2 row-span-1"
                  : index === 1
                  ? "md:col-span-2 md:row-span-1 col-span-1 row-span-1"
                  : index === 2
                  ? "md:col-span-1 md:row-span-2 col-span-1 row-span-1"
                  : "md:col-span-2 md:row-span-1 col-span-1 row-span-1"
              }`}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              layout
            >
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={image.url}
                  src={image.url}
                  alt={image.title}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7 }}
                  layout
                />
              </AnimatePresence>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <motion.h2
                  className="text-white font-serif text-lg md:text-xl lg:text-2xl mb-1 tracking-wider"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: hoveredIndex === index ? 0 : 20,
                    opacity: hoveredIndex === index ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {image.title}
                </motion.h2>
                {image.subtitle && (
                  <motion.p
                    className="text-white/90 text-xs md:text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: hoveredIndex === index ? 0 : 20,
                      opacity: hoveredIndex === index ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {image.subtitle}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
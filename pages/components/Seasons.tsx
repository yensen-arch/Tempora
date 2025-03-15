"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const seasons = [
  {
    id: "spring",
    title: "Spring Awakening",
    description:
      "A time of new beginnings, fresh starts, and blooming possibilities. Every dawn brings the promise of growth and renewal.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684526/samples/animals/three-dogs.jpg",
    color: "bg-[#f5e6d3]",
  },
  {
    id: "summer",
    title: "Summer Grace",
    description:
      "Basking in the warmth of achievement and joy. These are the days of fullness and abundance.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684526/samples/animals/three-dogs.jpg",
    color: "bg-[#e8d5c4]",
  },
  {
    id: "autumn",
    title: "Autumn Reflection",
    description:
      "A season of gathering wisdom, embracing change, and finding beauty in transformation.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684526/samples/animals/three-dogs.jpg",
    color: "bg-[#d4c3b3]",
  },
  {
    id: "winter",
    title: "Winter Solitude",
    description:
      "In the quiet moments of rest and contemplation, we find our deepest strength and prepare for renewal.",
    image:
      "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734684526/samples/animals/three-dogs.jpg",
    color: "bg-[#c2b2a3]",
  },
];

export default function SeasonsOfLife() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden font-serif">
      {/* Hero Section */}
      <section className="relative h-screen w-full bg-[#f9f1e7] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl text-[#3c3229] mb-6">
            The Seasons of Life
          </h1>
          <p className="text-lg md:text-xl text-[#5c4b3f] max-w-xl mx-auto">
            Every moment carries its own beauty, each season brings its unique
            gifts
          </p>
        </motion.div>
      </section>

      {/* Seasons Sections */}
      {seasons.map((season, index) => (
        <section
          key={season.id}
          className={`min-h-screen w-full ${season.color} relative flex items-center`}
          aria-labelledby={`heading-${season.id}`}
        >
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 0 ? "" : "lg:flex-row-reverse"
              }`}
            >
              {index % 2 === 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -500 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                  >
                    <h2
                      id={`heading-${season.id}`}
                      className="text-3xl md:text-5xl text-[#3c3229]"
                    >
                      {season.title}
                    </h2>
                    <p className="text-lg text-[#5c4b3f] max-w-xl">
                      {season.description}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 500 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[400px] w-full "
                  >
                    <Image
                      src={season.image}
                      alt={`Illustration for ${season.title}`}
                      fill
                      loading="lazy"
                      className="object-cover rounded-lg shadow-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[400px] w-full "
                  >
                    <Image
                      src={season.image}
                      alt={`Illustration for ${season.title}`}
                      fill
                      className="object-cover rounded-lg shadow-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                  >
                    <h2
                      id={`heading-${season.id}`}
                      className="text-3xl md:text-5xl text-[#3c3229]"
                    >
                      {season.title}
                    </h2>
                    <p className="text-lg text-[#5c4b3f] max-w-xl">
                      {season.description}
                    </p>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}

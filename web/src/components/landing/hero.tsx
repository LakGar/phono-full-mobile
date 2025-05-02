"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";
import Link from "next/link";

const positions = [
  { left: "10%", top: "20%" },
  { left: "20%", top: "80%" },
  { left: "30%", top: "40%" },
  { left: "40%", top: "60%" },
  { left: "50%", top: "30%" },
  { left: "60%", top: "70%" },
  { left: "70%", top: "50%" },
  { left: "80%", top: "90%" },
  { left: "90%", top: "10%" },
];

const heights = Array.from({ length: 20 }).map((_, i) => ({
  initial: 30 + Math.sin(i * 0.5) * 20,
  max: 50 + Math.sin(i * 0.5) * 30,
}));

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {positions.map((pos, index) => (
          <motion.div
            key={index}
            className="absolute text-[#e54545] opacity-20"
            style={pos}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Music2 className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
            Your Music Collection,
            <br />
            <span className="text-[#e54545]">Organized</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Phono helps you organize, discover, and share your music collection
            with ease. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#e54545] text-white rounded-lg hover:bg-[#e54545]/90 transition-colors duration-200 text-lg font-medium"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Audio Visualizer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1">
        {heights.map((height, index) => (
          <motion.div
            key={index}
            className="w-1 bg-[#e54545] rounded-t-full"
            style={{ height: `${height.initial}px` }}
            animate={{
              height: [
                `${height.initial}px`,
                `${height.max}px`,
                `${height.initial}px`,
              ],
            }}
            transition={{
              duration: 2 + index * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </section>
  );
}

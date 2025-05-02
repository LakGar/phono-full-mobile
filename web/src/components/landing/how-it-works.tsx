"use client";
import React from "react";
import { motion } from "framer-motion";
import { Disc3, Search, Share2, Plus, Music2, Album } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Music",
    description:
      "Explore a vast collection of vinyl records and albums. Use our intelligent search to find exactly what you're looking for.",
  },
  {
    icon: Plus,
    title: "Build Collections",
    description:
      "Create and organize your personal collections. Add albums, add notes, and share your musical journey.",
  },
  {
    icon: Share2,
    title: "Share & Connect",
    description:
      "Share your collections with friends and the community. Discover what others are listening to.",
  },
];

const features = [
  {
    icon: Music2,
    title: "Smart Recommendations",
    description:
      "Get personalized recommendations based on your collection and listening habits.",
    stats: "10K+",
    statLabel: "Albums Discovered",
  },
  {
    icon: Album,
    title: "Vinyl Collection",
    description:
      "Track your vinyl collection with detailed information and condition notes.",
    stats: "5K+",
    statLabel: "Collections Created",
  },
  {
    icon: Disc3,
    title: "Music Discovery",
    description:
      "Discover new music through our curated collections and community picks.",
    stats: "1M+",
    statLabel: "Records Cataloged",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 bg-black relative" id="features">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-white">
            Your Music Journey,{" "}
            <span className="text-[#e54545]">Simplified</span>
          </h2>
          <p className="text-xl text-gray-400">
            Discover, collect, and share your favorite records in a beautifully
            organized space
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="p-8 h-full border border-gray-800 rounded-xl hover:border-[#e54545]/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#e54545]/10 flex items-center justify-center mb-6 group-hover:bg-[#e54545]/20 transition-colors">
                  <step.icon className="w-6 h-6 text-[#e54545]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="p-8 h-[320px] border border-gray-800 rounded-xl hover:border-[#e54545]/50 transition-colors flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#e54545]/10 flex items-center justify-center mb-6 group-hover:bg-[#e54545]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#e54545]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  {feature.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#e54545]">
                    {feature.stats}
                  </span>
                  <span className="text-gray-500">{feature.statLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";
import React from "react";
import { Card } from "../ui/card";
import { Disc3, Music2, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export function Science() {
  return (
    <section className="py-32 bg-black relative" id="science">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5">
          <div className="absolute inset-0 rounded-full border-2 border-[#e54545] animate-spin-slow" />
          <div
            className="absolute inset-8 rounded-full border-2 border-[#e54545] animate-spin-slow"
            style={{ animationDelay: "-2s" }}
          />
          <div
            className="absolute inset-16 rounded-full border-2 border-[#e54545] animate-spin-slow"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="absolute inset-24 rounded-full border-2 border-[#e54545] animate-spin-slow"
            style={{ animationDelay: "-6s" }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-white"
          >
            The Power of <span className="text-[#e54545]">Music</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Backed by science and loved by collectors worldwide
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full"
            >
              <Card className="p-8 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl group hover:border-[#e54545]/50 transition-all duration-300 h-full flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Disc3 className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <blockquote className="text-gray-400 text-lg leading-relaxed">
                      &quot;Vinyl sales have grown for 16 consecutive years,
                      showing a strong resurgence in physical music
                      collecting.&quot;
                    </blockquote>
                    <footer className="mt-6 text-sm text-gray-500 font-medium">
                      — Recording Industry Association of America
                    </footer>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-full"
            >
              <Card className="p-8 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl group hover:border-[#e54545]/50 transition-all duration-300 h-full flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Music2 className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <blockquote className="text-gray-400 text-lg leading-relaxed">
                      &quot;Music has been shown to improve mood, reduce stress,
                      and enhance cognitive performance.&quot;
                    </blockquote>
                    <footer className="mt-6 text-sm text-gray-500 font-medium">
                      — Harvard Medical School Study
                    </footer>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-full"
            >
              <Card className="p-8 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl group hover:border-[#e54545]/50 transition-all duration-300 h-full flex flex-col">
                <div className="relative flex-1">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <blockquote className="text-gray-400 text-lg leading-relaxed">
                      &quot;I started collecting vinyl for the sound. Now,
                      it&apos;s my passion and community.&quot;
                    </blockquote>
                    <footer className="mt-6 text-sm text-gray-500 font-medium">
                      — Sarah K., vinyl collector
                    </footer>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

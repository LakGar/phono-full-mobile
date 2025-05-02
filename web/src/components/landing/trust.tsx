"use client";
import React from "react";
import { Card } from "../ui/card";
import { Shield, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

export function Trust() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-white"
          >
            Built with <span className="text-[#e54545]">Trust & Care</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Your privacy and well-being are our top priorities
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
                    <Shield className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      Your privacy, always protected
                    </h3>
                    <p className="text-gray-400">
                      End-to-end encrypted + local-first storage planned
                    </p>
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
                    <Heart className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      Built with well-being in mind
                    </h3>
                    <p className="text-gray-400">
                      Rooted in research, guided by simplicity
                    </p>
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
                    <Users className="w-6 h-6 text-[#e54545]" />
                  </div>
                  <div className="pt-12">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      For everyone in between
                    </h3>
                    <p className="text-gray-400">Phono adapts to your style</p>
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

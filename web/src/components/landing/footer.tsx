"use client";
import React, { useState } from "react";
import { ContactModal } from "./contact-modal";
import { Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <footer className="bg-black py-12 md:py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center md:text-left"
              >
                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
                  © 2025 Phono · Made with{" "}
                  <Heart className="w-4 h-4 text-[#e54545]" /> in California
                </p>
              </motion.div>
              <motion.nav
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base"
              >
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-400 hover:text-[#e54545] transition-colors duration-200 px-2 py-1"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("differentiators")}
                  className="text-gray-400 hover:text-[#e54545] transition-colors duration-200 px-2 py-1"
                >
                  Features
                </button>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-[#e54545] transition-colors duration-200 px-2 py-1"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-[#e54545] transition-colors duration-200 px-2 py-1"
                >
                  Terms
                </Link>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="text-gray-400 hover:text-[#e54545] transition-colors duration-200 px-2 py-1"
                >
                  Contact
                </button>
              </motion.nav>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}

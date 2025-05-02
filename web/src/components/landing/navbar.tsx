"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Image src="/phono-full.png" alt="Phono" width={200} height={200} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Navigation Links */}
          <div
            className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto bg-black/90 md:bg-transparent p-4 md:p-0`}
          >
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-gray-300 hover:text-[#e54545] transition-colors font-medium w-full md:w-auto text-left md:text-center"
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("discover")}
              className="text-sm text-gray-300 hover:text-[#e54545] transition-colors font-medium w-full md:w-auto text-left md:text-center"
            >
              Discover
            </button>
            <button
              onClick={() => scrollToSection("science")}
              className="text-sm text-gray-300 hover:text-[#e54545] transition-colors font-medium w-full md:w-auto text-left md:text-center"
            >
              Science
            </button>
            <Button
              variant="default"
              className="bg-[#e54545] hover:bg-[#ff6b6b] text-white text-sm transition-colors w-full md:w-auto mt-4 md:mt-0"
              onClick={() => scrollToSection("signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

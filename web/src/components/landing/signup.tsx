"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Signup form submission started");
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    console.log("Sending signup data:", data);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Signup response received:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to join waitlist");
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return (
    <section className="py-32 bg-black relative h-[95vh]">
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
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-white"
          >
            Be Among the{" "}
            <span className="text-[#e54545]">First to Collect</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 mb-12"
          >
            Reserve your spot for Phono&apos;s early access.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="p-8 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl group hover:border-[#e54545]/50 transition-all duration-300">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                action="javascript:void(0);"
              >
                <div className="space-y-4">
                  <Input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full h-12 text-lg bg-black/50 border-gray-800 focus:border-[#e54545] focus:ring-[#e54545] text-white placeholder-gray-500"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    required
                    className="w-full h-12 text-lg bg-black/50 border-gray-800 focus:border-[#e54545] focus:ring-[#e54545] text-white placeholder-gray-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && (
                  <p className="text-green-500 text-sm">
                    Successfully joined the waitlist!
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#e54545] hover:bg-[#e54545]/90 text-white text-lg font-medium transition-all duration-300 group"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join the Waitlist
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-6 text-[8px] md:text-sm text-gray-500 flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#e54545]"></span>
                No spam. Just first access and thoughtful updates.
              </motion.p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

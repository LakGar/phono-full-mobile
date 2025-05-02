"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "@/lib/stripe";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const { sessionId } = await createCheckoutSession();
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      if (error) {
        console.error("Stripe checkout error:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Upgrade to <span className="text-[#e54545]">Pro</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-400"
            >
              Get unlimited access to all Pro features
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative bg-black/80 backdrop-blur-sm border border-[#e54545] rounded-xl p-8 transition-all duration-300 hover:border-[#e54545]/50"
          >
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="text-xs font-medium text-[#e54545]">PRO_02</div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Pro Plan
              </h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$2.99</span>
                <span className="text-sm ml-1 text-white/60">/month</span>
              </div>
              <p className="text-sm text-white/60 mt-2">
                For serious collectors who want more features
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Unlimited records in your collection",
                "Advanced organization and tagging",
                "AI-powered recommendations",
                "Priority support",
                "Custom collections",
                "Export functionality",
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-[#e54545] mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-[#e54545] text-white hover:bg-[#e54545]/90"
            >
              {isLoading ? "Processing..." : "Subscribe Now"}
            </Button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Secure payment powered by Stripe
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

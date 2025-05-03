"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContactModal } from "./contact-modal";
import { useState } from "react";

export function Pricing() {
  const plans = [
    {
      name: "FREE",
      price: "$0",
      description: "Perfect for vinyl enthusiasts just starting out",
      features: [
        "One collection",
        "up to 10 records in your collection",
        "Basic organization features",
        "Standard recommendations",
        "Community access",
      ],
      category: "01",
      buttonText: "GET STARTED",
      buttonLink: "#signup",
      highlighted: false,
    },
    {
      name: "PRO",
      price: "$2.99",
      period: "/month",
      description: "For serious collectors who want more features",
      features: [
        "Unlimited records in your collection",
        "Advanced organization and tagging",
        "AI-powered recommendations",
        "Priority support",
        "Custom collections",
        "Export functionality",
      ],
      category: "02",
      buttonText: "UPGRADE NOW",
      buttonLink: "/subscription",
      highlighted: true,
    },
    {
      name: "STORE FRONT SOLUTIONS",
      price: "Custom",
      description: "For record stores and large collections",
      features: [
        "Everything in Pro",
        "Custom branding",
        "API access",
        "Dedicated account manager",
        "Advanced analytics",
        "Team collaboration",
      ],
      category: "03",
      buttonText: "CONTACT US",
      buttonLink: "#pricing",
      highlighted: false,
    },
  ];
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section
      id="pricing"
      className="relative py-24 bg-black text-white overflow-hidden"
    >
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
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Simple, Transparent{" "}
              <span className="text-[#e54545]">Pricing</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-400"
            >
              Choose the plan that&apos;s right for you
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`group relative ${
                  plan.highlighted ? "md:-mt-4 md:mb-4" : ""
                }`}
              >
                <div
                  className={`relative bg-black/80 backdrop-blur-sm border ${
                    plan.highlighted ? "border-[#e54545]" : "border-gray-800"
                  } rounded-xl p-8 transition-all duration-300 group-hover:border-[#e54545]/50 h-full flex flex-col`}
                >
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-xs font-medium text-[#e54545]">
                      {plan.category}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold tracking-tight mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm ml-1 text-white/60">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-[#e54545] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.buttonLink} className="block w-full">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-[#e54545] text-white hover:bg-[#e54545]/90"
                          : "bg-black text-white border-2 border-[#e54545] hover:bg-[#e54545] hover:text-white"
                      }`}
                      onClick={() => {
                        if (plan.buttonLink === "#pricing") {
                          setIsContactModalOpen(true);
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
}

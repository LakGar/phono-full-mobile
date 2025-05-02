import React from "react";
import Link from "next/link";
import { ArrowLeft, Music2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5">
          <div className="absolute inset-0 rounded-full border-2 border-[#e54545]" />
          <div className="absolute inset-8 rounded-full border-2 border-[#e54545]" />
          <div className="absolute inset-16 rounded-full border-2 border-[#e54545]" />
          <div className="absolute inset-24 rounded-full border-2 border-[#e54545]" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-gray-400 hover:text-[#e54545] mb-8 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-[#e54545]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Privacy Policy
              </h1>
            </div>

            <div className="prose prose-lg max-w-none prose-invert">
              <p className="text-gray-400 mb-8">Last updated: March 2024</p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Introduction
              </h2>
              <p className="text-gray-400 mb-6">
                At Phono, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, and protect your personal
                information when you use our music collection application.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Information We Collect
              </h2>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Account information (email, name)</li>
                <li>Music collection data</li>
                <li>Usage data and analytics</li>
                <li>Device information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To communicate with you</li>
                <li>To ensure security and prevent fraud</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Data Security
              </h2>
              <p className="text-gray-400 mb-6">
                We implement industry-standard security measures to protect your
                data. All collection data is encrypted, and we regularly update
                our security practices.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Your Rights
              </h2>
              <p className="text-gray-400 mb-6">
                You have the right to access, correct, or delete your personal
                information. You can also opt-out of certain data collection
                practices.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-400">
                If you have any questions about this Privacy Policy, please
                contact us at privacy@phono.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

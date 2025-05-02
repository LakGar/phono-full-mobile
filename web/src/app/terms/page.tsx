import React from "react";
import Link from "next/link";
import { ArrowLeft, Music2 } from "lucide-react";

export default function TermsPage() {
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
                Terms of Service
              </h1>
            </div>

            <div className="prose prose-lg max-w-none prose-invert">
              <p className="text-gray-400 mb-8">Last updated: March 2024</p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Agreement to Terms
              </h2>
              <p className="text-gray-400 mb-6">
                By accessing or using Phono, you agree to be bound by these
                Terms of Service. If you disagree with any part of the terms,
                you may not access the service.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Use License
              </h2>
              <p className="text-gray-400 mb-6">
                Permission is granted to temporarily use Phono for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                User Responsibilities
              </h2>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Maintain the security of your account</li>
                <li>Not share your account credentials</li>
                <li>Use the service in compliance with laws</li>
                <li>Respect other users&apos; privacy</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Content Ownership
              </h2>
              <p className="text-gray-400 mb-6">
                You retain all rights to your music collection and content. By
                using Phono, you grant us a license to store and process your
                content to provide the service.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Service Modifications
              </h2>
              <p className="text-gray-400 mb-6">
                We reserve the right to modify or discontinue the service at any
                time without notice. We shall not be liable for any
                modification, suspension, or discontinuance of the service.
              </p>

              <h2 className="text-2xl font-semibold text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-400">
                If you have any questions about these Terms, please contact us
                at legal@phono.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

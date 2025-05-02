"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2, Music2, Mail, User, MessageSquare } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submission started");
    event.preventDefault();
    event.stopPropagation();
    setIsLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    console.log("Sending data:", data);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Response received:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error during submission:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-2xl bg-[#0a0a0a] p-0 overflow-hidden rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e54545] to-transparent" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#e54545] to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-l from-[#e54545] to-transparent" />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-t from-[#e54545] to-transparent" />

          {/* Content */}
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#e54545]/10 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-[#e54545]" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-display font-bold text-white">
                  Get in Touch
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  We&apos;d love to hear from you
                </DialogDescription>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              action="javascript:void(0);"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <Input
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                      className="h-12 text-lg bg-black/50 border-gray-800 focus:border-[#e54545] focus:ring-[#e54545] text-white placeholder-gray-500 pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Your email"
                      required
                      className="h-12 text-lg bg-black/50 border-gray-800 focus:border-[#e54545] focus:ring-[#e54545] text-white placeholder-gray-500 pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-4 text-gray-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <Textarea
                    name="message"
                    placeholder="Your message"
                    required
                    className="min-h-[150px] text-lg bg-black/50 border-gray-800 focus:border-[#e54545] focus:ring-[#e54545] text-white placeholder-gray-500 pl-10 pt-2"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm">
                  Message sent successfully!
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
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

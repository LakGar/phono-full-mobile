"use client";
import React from "react";
import { Card } from "../ui/card";
import {
  Disc3,
  Search,
  Share2,
  Music2,
  Album,
  Headphones,
  PlayCircle,
  ListMusic,
} from "lucide-react";

export function Differentiators() {
  return (
    <section className="py-24 bg-black" id="discover">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-white">
          Built for <span className="text-[#e54545]">Music Lovers</span>, By
          Music Lovers
        </h2>
        <p className="text-lg md:text-xl text-center text-gray-400 max-w-3xl mx-auto mb-16">
          Unlike typical music apps, Phono focuses on helping you discover,
          collect, and share your favorite records. Whether you&apos;re building
          your vinyl collection, exploring new music, or connecting with other
          enthusiasts — Phono becomes your personal music curator.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border border-gray-800 bg-black/50 backdrop-blur-sm hover:border-[#e54545]/50 transition-all duration-300 rounded-xl">
            <h3 className="text-2xl font-semibold mb-6 text-white">
              Key Features
            </h3>
            <ul className="space-y-6 text-gray-400">
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Disc3 className="w-5 h-5" />
                </div>
                <span className="pt-1">Vinyl Collection Management</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Search className="w-5 h-5" />
                </div>
                <span className="pt-1">Smart Music Discovery</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="pt-1">Social Sharing & Community</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Music2 className="w-5 h-5" />
                </div>
                <span className="pt-1">Personalized Recommendations</span>
              </li>
            </ul>
          </Card>
          <Card className="p-8 border border-gray-800 bg-black/50 backdrop-blur-sm hover:border-[#e54545]/50 transition-all duration-300 rounded-xl">
            <h3 className="text-2xl font-semibold mb-6 text-white">
              Use Cases
            </h3>
            <ul className="space-y-6 text-gray-400">
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Album className="w-5 h-5" />
                </div>
                <span className="pt-1">Vinyl Collection Tracking</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="pt-1">Music Discovery</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <span className="pt-1">Playlist Creation</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#e54545]/10 text-[#e54545]">
                  <ListMusic className="w-5 h-5" />
                </div>
                <span className="pt-1">Music Cataloging</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Differentiators } from "@/components/landing/differentiators";
import { Science } from "@/components/landing/science";
import { Signup } from "@/components/landing/signup";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";

export default function Home() {
  return (
    <main className="bg-black w-full overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <section className="min-h-screen py-16 md:py-32" id="how-it-works">
          <HowItWorks />
        </section>

        <section className="min-h-screen py-16 md:py-32" id="science">
          <Science />
        </section>
        <section className="min-h-screen py-16 md:py-32" id="trust">
          <Trust />
        </section>
        <section className="min-h-screen py-16 md:py-32" id="pricing">
          <Pricing />
        </section>
        <section className="min-h-screen py-16 md:py-32" id="differentiators">
          <Differentiators />
        </section>
        <section className="min-h-screen mt-16 py-16 md:py-32" id="signup">
          <Signup />
        </section>
      </div>
      <Footer />
    </main>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <h1 className="text-6xl font-display font-bold mb-4">500</h1>
      <h2 className="text-2xl text-gray-600 mb-8">Something went wrong</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        We&apos;re sorry, but something went wrong on our end. Please try again
        later.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}

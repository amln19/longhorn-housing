"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ApartmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Apartments page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-5xl mb-4">🏠</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Couldn&apos;t load apartments
        </h2>
        <p className="text-text-secondary mb-6">
          We had trouble loading the listings. This is usually temporary.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}

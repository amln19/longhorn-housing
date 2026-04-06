"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Map page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Map failed to load
        </h2>
        <p className="text-text-secondary mb-6">
          There was a problem loading the map. Check your connection and try
          again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}

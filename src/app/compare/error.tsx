"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Compare page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Comparison failed
        </h2>
        <p className="text-text-secondary mb-6">
          We couldn&apos;t load the comparison data. Try selecting the
          apartments again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Link href="/apartments">
            <Button>Browse Apartments</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

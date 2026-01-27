import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CompareContent from "./compare-content";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
        <p className="text-gray-500">Loading comparison...</p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompareContent />
    </Suspense>
  );
}

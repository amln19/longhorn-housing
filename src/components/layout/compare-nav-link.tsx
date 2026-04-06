"use client";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCompareList } from "@/hooks/use-compare-list";
import { cn } from "@/lib/utils";

export function CompareNavLink() {
  const { compareList } = useCompareList();
  const pathname = usePathname();
  const isActive = pathname.startsWith("/compare");

  const href =
    compareList.length > 0
      ? `/compare?ids=${compareList.join(",")}`
      : "/compare";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all relative",
        isActive
          ? "bg-surface text-burnt-orange shadow-sm"
          : "text-text-secondary hover:text-text-primary hover:bg-surface/50",
      )}
    >
      <GitCompare className="h-4 w-4" />
      Compare
      {compareList.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-burnt-orange text-white text-[10px] font-bold flex items-center justify-center">
          {compareList.length}
        </span>
      )}
    </Link>
  );
}

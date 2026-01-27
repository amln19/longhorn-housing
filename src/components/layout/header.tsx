"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Home, Search, GitCompare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/apartments", icon: Search },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Compare", href: "/compare", icon: GitCompare },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 rounded-xl bg-linear-to-br from-[#bf5700] to-[#ffa060] overflow-hidden">
              <span
                className="text-2xl absolute top-px left-[px] z-0 scale-105 opacity-95"
              >
                🤘
              </span>
              <span
                className="text-2xl absolute bottom-px right-0.5 z-10 scale-95 opacity-95"
              >
                🏠
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Longhorn<span className="text-burnt-orange">Housing</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1 bg-gray-100/80 rounded-xl p-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-white text-burnt-orange shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn("md:hidden", mobileMenuOpen ? "block pb-4" : "hidden")}
        >
          <div className="space-y-1 bg-gray-50 rounded-xl p-2 mt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-white text-burnt-orange shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

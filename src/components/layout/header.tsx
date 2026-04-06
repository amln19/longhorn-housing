"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Search,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CompareNavLink } from "@/components/layout/compare-nav-link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Browse", href: "/apartments", icon: Search },
  { name: "Map", href: "/map", icon: MapPin },
  { name: "Roommates", href: "/roommates", icon: Users },
  { name: "Subleases", href: "/subleases", icon: FileText },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-base bg-surface/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/lh-logo.png"
              alt="Logo"
              width={150}
              height={40}
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-text-primary">
              Longhorn<span className="text-burnt-orange">Housing</span>
            </span>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-1 bg-surface-raised rounded-xl p-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-surface text-burnt-orange shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
            {/* Compare gets its own smart component */}
            <CompareNavLink />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden",
            mobileMenuOpen ? "block pb-4" : "hidden",
          )}
        >
          <div className="space-y-1 bg-surface-raised rounded-xl p-2 mt-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-surface text-burnt-orange shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            {/* Mobile Compare link */}
            <div onClick={() => setMobileMenuOpen(false)}>
              <CompareNavLink />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

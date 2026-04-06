"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  User,
  Heart,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  LogIn,
} from "lucide-react";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface-raised animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </Link>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-raised transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-burnt-orange text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border-base py-2 z-50">
          <div className="px-4 py-2 border-b border-border-base">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <MenuLink
              href="/dashboard"
              icon={User}
              label="Dashboard"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/dashboard#favorites"
              icon={Heart}
              label="My Favorites"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/roommates/profile"
              icon={Users}
              label="Roommate Profile"
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href="/subleases/new"
              icon={FileText}
              label="Post Sublease"
              onClick={() => setOpen(false)}
            />
          </div>
          <div className="border-t border-border-base pt-1">
            <button
              onClick={async () => {
                await signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

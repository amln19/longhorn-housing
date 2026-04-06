"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  apartmentId: string;
  size?: "sm" | "lg";
  className?: string;
  onToggle?: (newFavorited: boolean) => void;
}

export function FavoriteButton({
  apartmentId,
  size = "sm",
  className,
  onToggle,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { favoriteIds, toggling, toggle } = useFavorites();

  if (!user) return null;

  const favorited = favoriteIds.has(apartmentId);
  const loading = toggling.has(apartmentId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    await toggle(apartmentId);
    onToggle?.(!favorited);
  };

  const sizeClasses =
    size === "lg" ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center justify-center transition-all duration-200 shrink-0",
        sizeClasses,
        favorited
          ? "bg-red-50 dark:bg-red-950 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
          : "bg-surface-raised text-text-muted hover:bg-surface-inset hover:text-red-400",
        className,
      )}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(iconSize, favorited && "fill-current")} />
    </button>
  );
}

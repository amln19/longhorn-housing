"use client";

import { FavoritesContext, useFavoritesProvider } from "@/hooks/use-favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const value = useFavoritesProvider();
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

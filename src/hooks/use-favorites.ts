"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  computeCardFromFavorite,
  type FavoriteWithApartment,
} from "@/lib/favorites-helpers";
import type { ApartmentCard } from "@/types";

interface FavoritesContextValue {
  /** IDs of all favorited apartments — O(1) lookup for buttons */
  favoriteIds: Set<string>;
  /** Full ApartmentCard data — used by the dashboard */
  favorites: ApartmentCard[];
  loading: boolean;
  /** IDs currently being toggled (for per-button loading state) */
  toggling: Set<string>;
  toggle: (apartmentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  favorites: [],
  loading: false,
  toggling: new Set(),
  toggle: async () => {},
  refresh: async () => {},
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function useFavoritesProvider(): FavoritesContextValue {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<ApartmentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        const entries = (data.favorites ?? []) as FavoriteWithApartment[];
        setFavoriteIds(new Set(entries.map((f) => f.apartmentId)));
        setFavorites(entries.map((e) => computeCardFromFavorite(e)));
      }
    } catch {
      // network failure — keep previous state
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch once when the user signs in; clear when they sign out.
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setFavoriteIds(new Set());
      setFavorites([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggle = useCallback(
    async (apartmentId: string) => {
      if (!user) return;

      const wasAlreadyFavorited = favoriteIds.has(apartmentId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasAlreadyFavorited) next.delete(apartmentId);
        else next.add(apartmentId);
        return next;
      });
      if (wasAlreadyFavorited) {
        setFavorites((prev) => prev.filter((f) => f.id !== apartmentId));
      }

      setToggling((prev) => new Set(prev).add(apartmentId));

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apartmentId }),
        });
        const data = await res.json();

        if (data.favorited) {
          // Added — refresh to get full card data for the dashboard list
          await refresh();
        } else {
          // Removed — already removed optimistically, just make sure IDs are consistent
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(apartmentId);
            return next;
          });
          setFavorites((prev) => prev.filter((f) => f.id !== apartmentId));
        }
      } catch {
        // Revert to server state on error
        await refresh();
      } finally {
        setToggling((prev) => {
          const next = new Set(prev);
          next.delete(apartmentId);
          return next;
        });
      }
    },
    [user, favoriteIds, refresh],
  );

  return { favoriteIds, favorites, loading, toggling, toggle, refresh };
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapLabelMode = "price" | "name-price" | "name";

interface MapViewProps {
  apartments: {
    id: string;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    priceMin: number;
  }[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (slug: string) => void;
  labelMode?: MapLabelMode;
}

// UT Austin coordinates
const UT_AUSTIN_CENTER: [number, number] = [-97.7394, 30.2849];

export function MapView({
  apartments,
  center = UT_AUSTIN_CENTER,
  zoom = 14,
  onMarkerClick,
  labelMode = "price",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const getMarkerLabel = useCallback(
    (apt: { name: string; priceMin: number }) => {
      switch (labelMode) {
        case "price":
          return `$${apt.priceMin.toLocaleString()}`;
        case "name":
          return apt.name.length > 20
            ? apt.name.substring(0, 18) + "..."
            : apt.name;
        case "name-price":
          const shortName =
            apt.name.length > 15 ? apt.name.substring(0, 13) + "..." : apt.name;
          return `${shortName} • $${apt.priceMin.toLocaleString()}`;
        default:
          return `$${apt.priceMin.toLocaleString()}`;
      }
    },
    [labelMode],
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // If no token, show placeholder
    if (!mapboxgl.accessToken) {
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add UT Austin marker
    const utMarker = document.createElement("div");
    utMarker.className = "ut-marker";
    utMarker.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: #BF5700;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">🤘</div>
    `;

    new mapboxgl.Marker({ element: utMarker })
      .setLngLat(UT_AUSTIN_CENTER)
      .setPopup(new mapboxgl.Popup().setHTML("<strong>UT Austin</strong>"))
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when apartments or labelMode changes
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add apartment markers
    apartments.forEach((apt) => {
      const label = getMarkerLabel(apt);
      const el = document.createElement("div");
      el.className = "apartment-marker";
      el.innerHTML = `
        <div class="marker-pill" style="
          background: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border: 2px solid #e5e7eb;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${label}
        </div>
      `;

      const markerPill = el.querySelector(".marker-pill") as HTMLElement;

      // Create popup for hover
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 8px;">
          <strong style="font-size: 14px;">${apt.name}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #BF5700; font-weight: 600;">
            Starting at $${apt.priceMin.toLocaleString()}/mo
          </p>
        </div>
      `);

      // Hover delay logic
      let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

      el.addEventListener("mouseenter", () => {
        if (markerPill) {
          markerPill.style.borderColor = "#BF5700";
          markerPill.style.transform = "scale(1.05)";
        }

        hoverTimeout = setTimeout(() => {
          popup.addTo(map.current!);
        }, 200);
      });

      el.addEventListener("mouseleave", () => {
        if (markerPill) {
          markerPill.style.borderColor = "#e5e7eb";
          markerPill.style.transform = "scale(1)";
        }

        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        popup.remove();
      });

      el.addEventListener("click", () => {
        if (onMarkerClick) {
          onMarkerClick(apt.slug);
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([apt.longitude, apt.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [apartments, onMarkerClick, getMarkerLabel]);

  // Show placeholder if no Mapbox token
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600 font-medium">Map View</p>
          <p className="text-sm text-gray-400 mt-2">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to enable maps
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full rounded-xl" />;
}

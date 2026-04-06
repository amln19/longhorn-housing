"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { escapeHtml } from "@/lib/utils";

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
  routeTo?: { lat: number; lng: number; name: string } | null;
  selectedApartment?: string | null;
}

const UT_AUSTIN_CENTER: [number, number] = [-97.7394, 30.2849];

export function MapView({
  apartments,
  center = UT_AUSTIN_CENTER,
  zoom = 14,
  onMarkerClick,
  labelMode = "price",
  routeTo,
  selectedApartment,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const routeLayerAdded = useRef(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

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
            apt.name.length > 15
              ? apt.name.substring(0, 13) + "..."
              : apt.name;
          return `${shortName} · $${apt.priceMin.toLocaleString()}`;
        default:
          return `$${apt.priceMin.toLocaleString()}`;
      }
    },
    [labelMode],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center,
      zoom,
      maxZoom: 18,
      minZoom: 11,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // UT Austin marker
    const utEl = document.createElement("div");
    utEl.innerHTML = `
      <div style="
        width: 44px; height: 44px;
        background: #BF5700;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 22px;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        cursor: pointer;
      ">🤘</div>
    `;

    new maplibregl.Marker({ element: utEl })
      .setLngLat(UT_AUSTIN_CENTER)
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          "<strong>The University of Texas at Austin</strong>",
        ),
      )
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when apartments/labelMode changes
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    apartments.forEach((apt) => {
      const label = getMarkerLabel(apt);
      const isSelected = selectedApartment === apt.slug;

      const el = document.createElement("div");
      el.className = "apartment-marker";
      el.innerHTML = `
        <div class="marker-pill" style="
          background: ${isSelected ? "#BF5700" : "white"};
          color: ${isSelected ? "white" : "#1f2937"};
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 1px 6px rgba(0,0,0,0.12);
          border: 1.5px solid ${isSelected ? "#BF5700" : "#e5e7eb"};
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        ">
          ${escapeHtml(label)}
        </div>
      `;

      const pill = el.querySelector(".marker-pill") as HTMLElement;

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "220px",
      }).setHTML(`
        <div style="padding: 8px 4px;">
          <strong style="font-size: 13px; display: block; margin-bottom: 4px;">
            ${escapeHtml(apt.name)}
          </strong>
          <span style="font-size: 12px; color: #BF5700; font-weight: 600;">
            From $${apt.priceMin.toLocaleString()}/mo
          </span>
        </div>
      `);

      let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

      el.addEventListener("mouseenter", () => {
        if (pill) {
          pill.style.borderColor = "#BF5700";
          pill.style.transform = "scale(1.08)";
          pill.style.zIndex = "10";
        }
        hoverTimeout = setTimeout(() => {
          if (map.current) popup.addTo(map.current);
        }, 150);
        timeouts.push(hoverTimeout);
      });

      el.addEventListener("mouseleave", () => {
        if (pill && !isSelected) {
          pill.style.borderColor = "#e5e7eb";
          pill.style.transform = "scale(1)";
          pill.style.zIndex = "";
        }
        if (hoverTimeout) clearTimeout(hoverTimeout);
        popup.remove();
      });

      el.addEventListener("click", () => {
        if (onMarkerClick) onMarkerClick(apt.slug);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([apt.longitude, apt.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [apartments, onMarkerClick, getMarkerLabel, selectedApartment]);

  // Route drawing
  useEffect(() => {
    if (!map.current || !routeTo || !selectedApartment) {
      // Remove route if no longer needed
      if (map.current && routeLayerAdded.current) {
        if (map.current.getLayer("route-line")) map.current.removeLayer("route-line");
        if (map.current.getLayer("route-outline")) map.current.removeLayer("route-outline");
        if (map.current.getSource("route")) map.current.removeSource("route");
        routeLayerAdded.current = false;
        setRouteInfo(null);
      }
      return;
    }

    const apt = apartments.find((a) => a.slug === selectedApartment);
    if (!apt) return;

    const fetchRoute = async () => {
      try {
        const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${apt.longitude},${apt.latitude};${routeTo.lng},${routeTo.lat}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return;

        const distanceKm = (route.distance / 1000).toFixed(1);
        const distanceMi = (route.distance / 1609.34).toFixed(1);
        const durationMin = Math.round(route.duration / 60);

        setRouteInfo({
          distance: `${distanceMi} mi (${distanceKm} km)`,
          duration: `${durationMin} min walk`,
        });

        const geojson = {
          type: "Feature" as const,
          properties: {},
          geometry: route.geometry,
        };

        if (map.current!.getSource("route")) {
          (map.current!.getSource("route") as maplibregl.GeoJSONSource).setData(
            geojson as GeoJSON.Feature,
          );
        } else {
          map.current!.addSource("route", {
            type: "geojson",
            data: geojson as GeoJSON.Feature,
          });
          map.current!.addLayer({
            id: "route-outline",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#ffffff",
              "line-width": 8,
            },
          });
          map.current!.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#BF5700",
              "line-width": 4,
            },
          });
          routeLayerAdded.current = true;
        }

        // Fit to route bounds
        const coords = route.geometry.coordinates;
        const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
        for (const coord of coords) {
          bounds.extend(coord as [number, number]);
        }
        map.current!.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [routeTo, selectedApartment, apartments]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {routeInfo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface rounded-xl shadow-xl border border-border-base px-5 py-3 flex items-center gap-4 z-10">
          <div className="text-center">
            <div className="text-lg font-bold text-burnt-orange">
              {routeInfo.duration}
            </div>
            <div className="text-xs text-text-muted">{routeInfo.distance}</div>
          </div>
        </div>
      )}
    </div>
  );
}

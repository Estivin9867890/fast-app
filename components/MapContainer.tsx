"use client";

import { useEffect, useRef, useState } from "react";
import { Rating, THEME_META } from "@/lib/mockData";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMarker = any;

interface MapContainerProps {
  ratings: Rating[];
  focusedRating?: Rating | null;
}

function buildMarkerHtml(score: number, color: string): string {
  return `<div style="
    background:${color};color:white;font-weight:900;font-size:13px;
    width:36px;height:36px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);display:flex;align-items:center;
    justify-content:center;border:2px solid white;
    box-shadow:0 2px 10px rgba(0,0,0,0.55);">
    <span style="transform:rotate(45deg)">${score}</span>
  </div>`;
}

function buildPopupHtml(r: Rating, scoreColor: string): string {
  const meta = THEME_META[r.theme];
  return `
    <div style="min-width:200px;font-family:system-ui;background:#18181b;
      border:1px solid #3f3f46;border-radius:12px;overflow:hidden;">
      <img src="${r.photo_url}" style="width:100%;height:80px;object-fit:cover;" />
      <div style="padding:10px;">
        <div style="font-size:11px;color:${meta.color};margin-bottom:4px;font-weight:600">
          ${meta.emoji} ${r.theme}
        </div>
        <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:4px">${r.title}</div>
        <div style="font-size:24px;font-weight:900;color:${scoreColor};">
          ${r.score}<span style="font-size:12px;color:#71717a">/10</span>
        </div>
        <div style="font-size:11px;color:#a1a1aa;font-style:italic;margin-top:4px">
          &ldquo;${r.comment}&rdquo;
        </div>
        <div style="margin-top:6px;font-size:11px;color:#52525b">— ${r.author}</div>
      </div>
    </div>`;
}

export default function MapContainerComponent({ ratings, focusedRating }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap>(null);
  const lRef = useRef<LeafletLib>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // ── Effect 1: initialize the map ONCE ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    import("leaflet").then((L) => {
      if (mapRef.current) return; // guard against StrictMode double-run

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map: LeafletMap = L.map(containerRef.current!, {
        center: [48.8566, 2.3522],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      lRef.current   = L;
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        lRef.current   = null;
      }
    };
  }, []); // intentionally empty — init once

  // ── Effect 2: sync markers whenever `ratings` changes ──────────────────────
  // This is the fix: separate effect, depends on [ratings, mapReady]
  useEffect(() => {
    if (!mapReady || !mapRef.current || !lRef.current) return;

    const L   = lRef.current;
    const map = mapRef.current;

    // Remove all existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for current (already-filtered) ratings
    ratings.forEach((r) => {
      if (!r.lat || !r.lng) return;

      const scoreColor = r.score >= 8 ? "#22c55e" : r.score >= 5 ? "#f59e0b" : "#ef4444";

      const icon: LeafletLib = L.divIcon({
        html: buildMarkerHtml(r.score, scoreColor),
        className: "",
        iconSize:    [36, 36],
        iconAnchor:  [18, 36],
        popupAnchor: [0, -38],
      });

      const marker: LeafletMarker = L.marker([r.lat, r.lng], { icon }).addTo(map);
      marker.bindPopup(buildPopupHtml(r, scoreColor), {
        className: "dark-popup",
        maxWidth: 240,
      });

      markersRef.current.push(marker);
    });
  }, [ratings, mapReady]);

  // ── Effect 3: fly to focused rating ────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !focusedRating?.lat) return;

    mapRef.current.flyTo([focusedRating.lat, focusedRating.lng], 15, { duration: 1 });

    markersRef.current.forEach((m: LeafletMarker) => {
      const ll = m.getLatLng();
      if (
        Math.abs(ll.lat - focusedRating.lat) < 0.0001 &&
        Math.abs(ll.lng - focusedRating.lng) < 0.0001
      ) {
        m.openPopup();
      }
    });
  }, [focusedRating, mapReady]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .dark-popup .leaflet-popup-tip-container { display: none; }
        .dark-popup .leaflet-popup-content { margin: 0 !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </>
  );
}

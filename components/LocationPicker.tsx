"use client";

import { useEffect, useRef, useState } from "react";

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number } | null) => void;
  onClose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L = any;

export default function LocationPicker({ value, onChange, onClose }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(value);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    import("leaflet").then((Leaflet: L) => {
      if (mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initial = value ?? { lat: 48.8566, lng: 2.3522 };
      const map = Leaflet.map(containerRef.current!, {
        center: [initial.lat, initial.lng],
        zoom: value ? 14 : 12,
        zoomControl: true,
      });

      Leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      if (value) {
        markerRef.current = Leaflet.marker([value.lat, value.lng]).addTo(map);
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = Leaflet.marker([lat, lng]).addTo(map);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <div>
          <h2 className="text-white font-black text-base">Choisir un lieu</h2>
          <p className="text-zinc-500 text-xs">
            {coords
              ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              : "Clique sur la carte pour placer un marqueur"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 px-4">
        <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-4">
        {coords && (
          <button
            onClick={() => { onChange(null); setCoords(null); onClose(); }}
            className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm"
          >
            Supprimer
          </button>
        )}
        <button
          onClick={() => { onChange(coords); onClose(); }}
          disabled={!coords}
          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm transition-colors"
        >
          {coords ? "Confirmer ce lieu" : "Aucun lieu sélectionné"}
        </button>
      </div>
    </div>
  );
}

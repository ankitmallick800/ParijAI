import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlaceLocation } from "@/interfaces/recommend.interface";

interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  order?: number;
}

interface MapViewProps {
  center: PlaceLocation;
  markers?: MapMarker[];
  zoom?: number;
}

export default function MapView({ center, markers = [], zoom = 13 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [center.lat, center.lng],
        zoom
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Add user location marker
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#2A1A0E;border:3px solid #FEF3E2;border-radius:50%;box-shadow:0 2px 8px rgba(42,26,14,0.35)"></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapInstance.current)
      .bindPopup("Your location");

    // Add place markers
    const bounds = L.latLngBounds([[center.lat, center.lng]]);

    markers.forEach((marker) => {
      const markerIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#D4621A,#F4AE52);border:2px solid #FEF3E2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FEF3E2;font-size:12px;font-weight:bold;box-shadow:0 2px 8px rgba(212,98,26,0.35)">${marker.order || "•"}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([marker.lat, marker.lng], { icon: markerIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`<b>${marker.name}</b>`);

      bounds.extend([marker.lat, marker.lng]);
    });

    // Draw route line between markers
    if (markers.length > 1) {
      const points: [number, number][] = [
        [center.lat, center.lng],
        ...markers
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((m) => [m.lat, m.lng] as [number, number]),
      ];

      L.polyline(points, {
        color: "#D4621A",
        weight: 3,
        opacity: 0.6,
        dashArray: "10, 10",
      }).addTo(mapInstance.current);
    }

    // Fit bounds
    if (markers.length > 0) {
      mapInstance.current.fitBounds(bounds, { padding: [40, 40] });
    }

    const map = mapInstance.current;
    const frame = requestAnimationFrame(() => map.invalidateSize());
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [center, markers, zoom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[300px]"
      style={{ zIndex: 0 }}
    />
  );
}

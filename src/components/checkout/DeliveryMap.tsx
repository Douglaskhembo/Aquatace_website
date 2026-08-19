import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPin, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnline } from "@/hooks/use-online";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { google: any; __aqtInitMap?: () => void; } }

const NAIROBI = { lat: -1.2921, lng: 36.8219 };

export interface DeliveryLocation {
  address: string;
  lat: number;
  lng: number;
}

let mapsPromise: Promise<void> | null = null;
function loadMaps(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    window.__aqtInitMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async&callback=__aqtInitMap&v=weekly`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

interface Props {
  value: DeliveryLocation | null;
  onChange: (loc: DeliveryLocation | null) => void;
}

export function DeliveryMap({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;

  useEffect(() => {
    if (!apiKey) { setError("Google Maps key not configured."); return; }
    let cancelled = false;
    loadMaps(apiKey).then(() => {
      if (cancelled) return;
      const g = window.google;
      const start = value ?? NAIROBI;
      const map = new g.maps.Map(containerRef.current!, {
        center: start,
        zoom: value ? 15 : 12,
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;
      const marker = new g.maps.Marker({
        map,
        position: start,
        draggable: true,
        animation: g.maps.Animation.DROP,
      });
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const p = marker.getPosition();
        if (!p) return;
        reverseGeocode(p.lat(), p.lng()).then((addr) => {
          const next = { address: addr, lat: p.lat(), lng: p.lng() };
          if (inputRef.current) inputRef.current.value = addr;
          onChange(next);
        });
      });
      map.addListener("click", (e: { latLng?: { lat: () => number; lng: () => number } }) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat(); const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        reverseGeocode(lat, lng).then((addr) => {
          if (inputRef.current) inputRef.current.value = addr;
          onChange({ address: addr, lat, lng });
        });
      });

      // Places Autocomplete on the input
      if (inputRef.current) {
        const ac = new g.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: "ke" },
        });
        ac.bindTo("bounds", map);
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place.geometry?.location) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || inputRef.current!.value;
          map.setCenter({ lat, lng }); map.setZoom(16);
          marker.setPosition({ lat, lng });
          onChange({ address, lat, lng });
        });
      }
      setReady(true);
    }).catch((e) => setError(e.message || "Map failed to load"));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve) => {
      const g = window.google;
      if (!g?.maps) return resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      const geocoder = new g.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: Array<{ formatted_address: string }> | null, status: string) => {
        if (status === "OK" && results && results[0]) resolve(results[0].formatted_address);
        else resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    });
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude; const lng = pos.coords.longitude;
        mapRef.current?.setCenter({ lat, lng });
        mapRef.current?.setZoom(16);
        markerRef.current?.setPosition({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        if (inputRef.current) inputRef.current.value = addr;
        onChange({ address: addr, lat, lng });
        setLocating(false);
      },
      (err) => { setError(err.message); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  const online = useOnline();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Serving all of Kenya — pin any address.</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
          }`}
          aria-live="polite"
        >
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {online ? "Online" : "Offline"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            defaultValue={value?.address ?? ""}
            placeholder="Search for your address in Kenya…"
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating || !ready} className="rounded-full">
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
          Use my location
        </Button>
      </div>
      <div
        ref={containerRef}
        className="h-[320px] w-full overflow-hidden rounded-2xl border border-border bg-muted"
        aria-label="Delivery location map"
      />
      {value && (
        <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span><span className="font-medium text-foreground">Pinned:</span> {value.address} ({value.lat.toFixed(5)}, {value.lng.toFixed(5)}). Drag the pin or click the map to adjust.</span>
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!ready && !error && <p className="text-xs text-muted-foreground">Loading map…</p>}
    </div>
  );
}

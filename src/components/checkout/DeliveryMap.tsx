import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { CheckCircle2, Loader2, LocateFixed, MapPin, Search, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOnline } from "@/hooks/use-online";
import type { LatLng } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

const NAIROBI: LatLng = { lat: -1.2921, lng: 36.8219 };

export interface DeliveryLocation {
  address: string;
  lat: number;
  lng: number;
  landmark?: string;
  instructions?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function reverseGeocode(pos: LatLng, signal?: AbortSignal): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const json = (await res.json()) as { display_name?: string };
  if (!json.display_name) throw new Error("No address found for this location");
  return json.display_name;
}

async function searchAddress(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=ke&limit=5&addressdetails=0`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Search failed");
  return (await res.json()) as NominatimResult[];
}

interface Props {
  value: DeliveryLocation | null;
  onChange: (loc: DeliveryLocation | null) => void;
}

export function DeliveryMap({ value, onChange }: Props) {
  const [pin, setPin] = useState<LatLng | null>(value ? { lat: value.lat, lng: value.lng } : null);
  const [address, setAddress] = useState(value?.address ?? "");
  const [addressLoading, setAddressLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(!!value);
  const [landmark, setLandmark] = useState(value?.landmark ?? "");
  const [instructions, setInstructions] = useState(value?.instructions ?? "");
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [query, setQuery] = useState(value?.address ?? "");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [flyToken, setFlyToken] = useState(0);
  const [flyCenter, setFlyCenter] = useState<LatLng>(pin ?? NAIROBI);

  const geocodeAbort = useRef<AbortController | null>(null);

  const online = useOnline();

  const applyPosition = useCallback(
    (pos: LatLng, opts?: { addressOverride?: string }) => {
      setPin(pos);
      setConfirmed(false);
      setResults([]);
      // Invalidate any previously confirmed location on the parent immediately — the customer
      // must explicitly re-confirm before this new pin position can be submitted with the order.
      onChange(null);
      if (opts?.addressOverride) {
        setAddress(opts.addressOverride);
        setQuery(opts.addressOverride);
        return;
      }
      geocodeAbort.current?.abort();
      const controller = new AbortController();
      geocodeAbort.current = controller;
      setAddressLoading(true);
      setError(null);
      reverseGeocode(pos, controller.signal)
        .then((addr) => {
          setAddress(addr);
          setQuery(addr);
        })
        .catch((e) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          // Fall back to raw coordinates — the customer can still type an address manually.
          const fallback = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
          setAddress(fallback);
          setQuery(fallback);
          setError("Couldn't look up an address for this spot — you can type one in manually.");
        })
        .finally(() => setAddressLoading(false));
    },
    [onChange],
  );

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 3) return;
    setSearching(true);
    setError(null);
    try {
      const res = await searchAddress(query.trim());
      if (res.length === 0) {
        setError("No matches found. Try a different search or drop the pin manually.");
        setResults([]);
      } else {
        setResults(res);
      }
    } catch {
      setError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r: NominatimResult) => {
    const pos = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    applyPosition(pos, { addressOverride: r.display_name });
    setFlyCenter(pos);
    setFlyToken((t) => t + 1);
    setResults([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported by this browser. Please drop the pin manually.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (posResult) => {
        const pos = { lat: posResult.coords.latitude, lng: posResult.coords.longitude };
        applyPosition(pos);
        setFlyCenter(pos);
        setFlyToken((t) => t + 1);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location permission denied — no problem, just drop the pin on the map manually.",
          );
        } else {
          setError("Couldn't get your current location. Please drop the pin manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const confirmLocation = () => {
    if (!pin) return;
    setConfirmed(true);
    onChange({
      address: address.trim() || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`,
      lat: pin.lat,
      lng: pin.lng,
      landmark: landmark.trim() || undefined,
      instructions: instructions.trim() || undefined,
    });
  };

  // Landmark/instructions are free text unrelated to the pin — sync them straight through
  // once a location is already confirmed, no need to re-confirm the position for these.
  useEffect(() => {
    if (!confirmed || !pin) return;
    onChange({
      address: address.trim() || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`,
      lat: pin.lat,
      lng: pin.lng,
      landmark: landmark.trim() || undefined,
      instructions: instructions.trim() || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmark, instructions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">📍 Select your delivery location</p>
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
      <p className="text-xs text-muted-foreground">Move the pin to your exact delivery location.</p>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search for your area (e.g. Ruiru, Kiambu)…"
            className="pl-9"
            autoComplete="off"
          />
          {results.length > 0 && (
            <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={searching || query.trim().length < 3}
            className="rounded-full"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={useMyLocation}
            disabled={locating}
            className="rounded-full"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Use my location</span>
          </Button>
        </div>
      </div>

      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-border sm:h-[380px]">
            <LeafletMap
              center={flyCenter}
              zoom={pin ? 15 : 12}
              marker={pin}
              onPositionChange={applyPosition}
              flyToToken={flyToken}
            />
          </div>
        </Suspense>
      </ClientOnly>

      {pin && (
        <div className="space-y-3 rounded-2xl bg-muted/50 p-3">
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-medium text-foreground">Selected:</span>{" "}
              {addressLoading ? "Looking up address…" : address} ({pin.lat.toFixed(5)},{" "}
              {pin.lng.toFixed(5)})
            </span>
          </p>
          {confirmed ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Location confirmed
            </p>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={confirmLocation}
              disabled={addressLoading}
              className="rounded-full"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm Location
            </Button>
          )}
        </div>
      )}
      {!pin && (
        <p className="text-xs text-muted-foreground">
          Tap the map, search above, or use your current location to drop a pin.
        </p>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="landmark">Landmark (optional)</Label>
          <Input
            id="landmark"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Quickmart"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="delivery-instructions">Delivery instructions (optional)</Label>
          <Textarea
            id="delivery-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Call when you arrive, gate code, preferred time…"
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-border bg-muted sm:h-[380px]">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading map…
      </p>
    </div>
  );
}

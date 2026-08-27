// Client-only Leaflet map. This module imports "leaflet" at the top level, which touches
// `window` as soon as it's evaluated — it must never be pulled into the SSR bundle. It's
// loaded exclusively via React.lazy() from DeliveryMap.tsx, inside a <ClientOnly> boundary.
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icon paths break under bundlers (Vite included) because they're
// resolved relative to the page URL instead of the bundled asset URL. Point them at the
// bundled asset URLs so the pin renders instead of a broken image.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface LatLng {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  center: LatLng;
  zoom: number;
  marker: LatLng | null;
  onPositionChange: (pos: LatLng) => void;
  /** Bumping this recenters/pans the map to `center` (e.g. after a search result or geolocation). */
  flyToToken: number;
}

function ClickHandler({ onPositionChange }: { onPositionChange: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToCenter({ center, flyToToken }: { center: LatLng; flyToToken: number }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToToken]);
  return null;
}

export default function LeafletMap({
  center,
  zoom,
  marker,
  onPositionChange,
  flyToToken,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler onPositionChange={onPositionChange} />
      <FlyToCenter center={center} flyToToken={flyToToken} />
      {marker && (
        <Marker
          position={marker}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng();
              onPositionChange({ lat: pos.lat, lng: pos.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}

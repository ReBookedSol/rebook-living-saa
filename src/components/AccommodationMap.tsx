import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Car,
  Footprints,
  Lock,
  Building2,
  Train,
  Bus,
} from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { getGautrainStation, isGautrainAccessible, getMycitiStation, isMycitiAccessible } from "@/lib/gautrain";
import L from "leaflet";

interface AccommodationMapProps {
  accommodationAddress: string;
  accommodationName: string;
  universityName?: string;
  city?: string;
  onDistanceCalculated?: (distance: string, duration: string) => void;
}

interface TravelInfo {
  driving: { distance: string; duration: string } | null;
  walking: { distance: string; duration: string } | null;
}

// Simple geocode using Nominatim (free, no API key)
async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "User-Agent": "ReBookLiving/1.0" } }
    );
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Calculate approximate distance between two points (Haversine)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateTravelTimes(distKm: number): TravelInfo {
  const drivingMin = Math.round((distKm / 40) * 60); // ~40km/h avg city
  const walkingMin = Math.round((distKm / 5) * 60); // ~5km/h walking
  return {
    driving: { distance: `${distKm.toFixed(1)} km`, duration: `${drivingMin} min` },
    walking: distKm < 15 ? { distance: `${distKm.toFixed(1)} km`, duration: `${walkingMin} min` } : null,
  };
}

// Custom marker icons
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const AccommodationMap = ({
  accommodationAddress,
  accommodationName,
  universityName,
  city,
  onDistanceCalculated,
}: AccommodationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const { accessLevel, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  const [isLoading, setIsLoading] = useState(true);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({ driving: null, walking: null });

  useEffect(() => {
    if (!isPaidUser) {
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [-26.2041, 28.0473],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    const fullAddress = [accommodationName, accommodationAddress, city].filter(Boolean).join(", ");

    (async () => {
      const accomLocation = await geocode(fullAddress + ", South Africa");
      if (!accomLocation) {
        setIsLoading(false);
        return;
      }

      map.setView([accomLocation.lat, accomLocation.lng], 14);
      L.marker([accomLocation.lat, accomLocation.lng], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`<strong>${accommodationName}</strong><br/>${accommodationAddress}`);

      // Train station markers
      if (universityName && isGautrainAccessible(universityName)) {
        const stationName = getGautrainStation(universityName);
        const stationLoc = await geocode(`${stationName} Gautrain Station, South Africa`);
        if (stationLoc) {
          L.marker([stationLoc.lat, stationLoc.lng], { icon: yellowIcon })
            .addTo(map)
            .bindPopup(`<strong>${stationName}</strong> (Gautrain)`);
        }
      }

      if (universityName && isMycitiAccessible(universityName)) {
        const stationName = getMycitiStation(universityName);
        const stationLoc = await geocode(`${stationName}, Cape Town, South Africa`);
        if (stationLoc) {
          L.marker([stationLoc.lat, stationLoc.lng], { icon: orangeIcon })
            .addTo(map)
            .bindPopup(`<strong>${stationName}</strong> (MyCiTi)`);
        }
      }

      // University marker + distance
      if (universityName) {
        const uniLoc = await geocode(`${universityName}, South Africa`);
        if (uniLoc) {
          L.marker([uniLoc.lat, uniLoc.lng], { icon: redIcon })
            .addTo(map)
            .bindPopup(`<strong>${universityName}</strong>`);

          const bounds = L.latLngBounds(
            [accomLocation.lat, accomLocation.lng],
            [uniLoc.lat, uniLoc.lng]
          );
          map.fitBounds(bounds, { padding: [50, 50] });

          const distKm = haversineDistance(accomLocation.lat, accomLocation.lng, uniLoc.lat, uniLoc.lng);
          const times = estimateTravelTimes(distKm);
          setTravelInfo(times);

          if (onDistanceCalculated && times.driving) {
            onDistanceCalculated(times.driving.distance, times.driving.duration);
          }

          // Draw a line between accommodation and university
          L.polyline(
            [[accomLocation.lat, accomLocation.lng], [uniLoc.lat, uniLoc.lng]],
            { color: "hsl(160, 84%, 34%)", weight: 3, dashArray: "8, 8", opacity: 0.7 }
          ).addTo(map);
        }
      }

      setIsLoading(false);
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isPaidUser, accommodationAddress, accommodationName, universityName, city]);

  if (accessLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="w-full h-64 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!isPaidUser) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-primary" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4 bg-white/90 rounded-lg shadow-lg">
                <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-sm mb-2">Interactive Maps</p>
                <p className="text-xs text-muted-foreground mb-3">
                  View distance to university, walking & driving times
                </p>
                <UpgradePrompt type="map" compact />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location & Distance
          </span>
          {universityName && (
            <Badge variant="secondary" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {universityName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {isLoading && <Skeleton className="w-full h-64 rounded-lg" />}
          <div
            ref={mapRef}
            className={`w-full h-64 rounded-lg ${isLoading ? "hidden" : ""}`}
          />
        </div>

        {universityName && (travelInfo.driving || travelInfo.walking) && (
          <div className="grid grid-cols-2 gap-3">
            {travelInfo.driving && (
              <div className="p-3 rounded-lg border text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Driving</span>
                </div>
                <p className="text-sm font-semibold">{travelInfo.driving.duration}</p>
                <p className="text-xs text-muted-foreground">{travelInfo.driving.distance}</p>
              </div>
            )}
            {travelInfo.walking && (
              <div className="p-3 rounded-lg border text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Walking</span>
                </div>
                <p className="text-sm font-semibold">{travelInfo.walking.duration}</p>
                <p className="text-xs text-muted-foreground">{travelInfo.walking.distance}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{accommodationName}</p>
            <p className="text-xs text-muted-foreground">{accommodationAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationMap;

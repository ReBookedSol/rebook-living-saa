import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Navigation,
  Car,
  Footprints,
  Clock,
  Lock,
  Building2,
  Maximize2,
} from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { loadGoogleMapsScript } from "@/lib/googleMapsConfig";

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

export const AccommodationMap = ({
  accommodationAddress,
  accommodationName,
  universityName,
  city,
  onDistanceCalculated,
}: AccommodationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  
  const { accessLevel, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";
  
  const [isLoading, setIsLoading] = useState(true);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({ driving: null, walking: null });
  const [showDirections, setShowDirections] = useState(false);
  const [travelMode, setTravelMode] = useState<"driving" | "walking">("driving");

  useEffect(() => {
    if (!isPaidUser) {
      setIsLoading(false);
      return;
    }

    const loadMap = () => {
      const google = (window as any).google;
      if (!google || !mapRef.current) return;

      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg default
        zoom: 14,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          mapTypeIds: ["roadmap", "satellite"],
        },
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      directionsRendererRef.current = new google.maps.DirectionsRenderer({ map });

      // Geocode accommodation address
      const geocoder = new google.maps.Geocoder();
      const fullAddress = [accommodationName, accommodationAddress, city].filter(Boolean).join(", ");
      
      geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const accommodationLocation = results[0].geometry.location;
          map.setCenter(accommodationLocation);
          
          // Add accommodation marker
          new google.maps.Marker({
            map,
            position: accommodationLocation,
            title: accommodationName,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          });

          // If university provided, calculate distance
          if (universityName) {
            const universityAddress = `${universityName}, South Africa`;
            
            geocoder.geocode({ address: universityAddress }, (uniResults: any, uniStatus: any) => {
              if (uniStatus === google.maps.GeocoderStatus.OK && uniResults[0]) {
                const universityLocation = uniResults[0].geometry.location;
                
                // Add university marker
                new google.maps.Marker({
                  map,
                  position: universityLocation,
                  title: universityName,
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  },
                });

                // Fit bounds to show both markers
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(accommodationLocation);
                bounds.extend(universityLocation);
                map.fitBounds(bounds);

                // Calculate travel times
                calculateTravelTime(accommodationLocation, universityLocation, google);
              }
            });
          }

          setIsLoading(false);
        } else {
          console.warn("Geocoding failed:", status);
          setIsLoading(false);
        }
      });
    };

    const calculateTravelTime = (origin: any, destination: any, google: any) => {
      const directionsService = new google.maps.DirectionsService();

      // Driving
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const route = result.routes[0].legs[0];
            setTravelInfo((prev) => ({
              ...prev,
              driving: {
                distance: route.distance.text,
                duration: route.duration.text,
              },
            }));
            
            if (onDistanceCalculated) {
              onDistanceCalculated(route.distance.text, route.duration.text);
            }
          }
        }
      );

      // Walking
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const route = result.routes[0].legs[0];
            setTravelInfo((prev) => ({
              ...prev,
              walking: {
                distance: route.distance.text,
                duration: route.duration.text,
              },
            }));
          }
        }
      );
    };

    // Load Google Maps script
    const loadAndInit = async () => {
      const success = await loadGoogleMapsScript();
      if (success) {
        loadMap();
      } else {
        console.warn("Failed to load Google Maps script");
        setIsLoading(false);
      }
    };

    loadAndInit();
  }, [isPaidUser, accommodationAddress, accommodationName, universityName, city]);

  const showRoute = (mode: "driving" | "walking") => {
    const google = (window as any).google;
    if (!google || !mapInstanceRef.current || !directionsRendererRef.current) return;

    setTravelMode(mode);
    setShowDirections(true);

    const directionsService = new google.maps.DirectionsService();
    const fullAddress = [accommodationName, accommodationAddress, city].filter(Boolean).join(", ");
    const universityAddress = `${universityName}, South Africa`;

    directionsService.route(
      {
        origin: fullAddress,
        destination: universityAddress,
        travelMode: mode === "driving" 
          ? google.maps.TravelMode.DRIVING 
          : google.maps.TravelMode.WALKING,
      },
      (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);
        }
      }
    );
  };

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
            {/* Blurred placeholder map */}
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4 bg-white/90 rounded-lg shadow-lg">
                <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-sm mb-2">Interactive Maps</p>
                <p className="text-xs text-muted-foreground mb-3">
                  View distance to university, walking & driving times
                </p>
                <UpgradePrompt 
                  type="map"
                  compact
                />
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
        {/* Map Container */}
        <div className="relative">
          {isLoading && (
            <Skeleton className="w-full h-64 rounded-lg" />
          )}
          <div 
            ref={mapRef} 
            className={`w-full h-64 rounded-lg ${isLoading ? 'hidden' : ''}`}
          />
        </div>

        {/* Travel Info */}
        {universityName && (travelInfo.driving || travelInfo.walking) && (
          <div className="grid grid-cols-2 gap-3">
            {travelInfo.driving && (
              <button
                onClick={() => showRoute("driving")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  showDirections && travelMode === "driving"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Driving</span>
                </div>
                <p className="text-sm font-semibold">{travelInfo.driving.duration}</p>
                <p className="text-xs text-muted-foreground">{travelInfo.driving.distance}</p>
              </button>
            )}
            {travelInfo.walking && (
              <button
                onClick={() => showRoute("walking")}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  showDirections && travelMode === "walking"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Walking</span>
                </div>
                <p className="text-sm font-semibold">{travelInfo.walking.duration}</p>
                <p className="text-xs text-muted-foreground">{travelInfo.walking.distance}</p>
              </button>
            )}
          </div>
        )}

        {/* Address */}
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

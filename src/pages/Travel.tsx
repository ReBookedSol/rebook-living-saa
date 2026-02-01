import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Train, 
  Bus, 
  Car, 
  MapPin, 
  DollarSign, 
  Clock,
  Users,
  Zap,
  Leaf,
  ChevronRight,
  Map as MapIcon
} from "lucide-react";
import GautrainInfo from "@/components/GautrainInfo";
import { loadGoogleMapsScript } from "@/lib/googleMapsConfig";

// PUTCO Routes data based on uploaded PDFs
const PUTCO_ROUTES = {
  soshanguve: {
    name: "Soshanguve",
    image: "/images/soshanguve-fares.jpg",
    routes: [
      { name: "Block BB - Pretoria", fare: "R28.40", distance: "~35km" },
      { name: "Block H - Pretoria", fare: "R26.20", distance: "~32km" },
      { name: "Block L - Pretoria", fare: "R25.00", distance: "~30km" },
      { name: "Rosslyn - Pretoria", fare: "R18.50", distance: "~20km" },
    ],
    stations: [
      { name: "Soshanguve Block BB", lat: -25.4833, lng: 28.0833 },
      { name: "Soshanguve Block H", lat: -25.5000, lng: 28.1000 },
      { name: "Rosslyn", lat: -25.7167, lng: 28.0667 },
    ],
  },
  ekangala: {
    name: "Ekangala",
    image: "/images/ekangala-fares.jpg",
    routes: [
      { name: "Ekangala - Pretoria CBD", fare: "R45.00", distance: "~65km" },
      { name: "Ekangala - Bronkhorstspruit", fare: "R15.00", distance: "~15km" },
      { name: "Ekangala - Mamelodi", fare: "R35.00", distance: "~45km" },
    ],
    stations: [
      { name: "Ekangala Main", lat: -25.6833, lng: 28.7500 },
      { name: "Bronkhorstspruit", lat: -25.8000, lng: 28.7333 },
    ],
  },
  tam: {
    name: "Tshwane Area",
    image: "", // No image for this region
    routes: [
      { name: "Atteridgeville - Pretoria", fare: "R18.00", distance: "~12km" },
      { name: "Mamelodi - Pretoria", fare: "R22.00", distance: "~25km" },
      { name: "Mabopane - Pretoria", fare: "R28.00", distance: "~35km" },
      { name: "Ga-Rankuwa - Pretoria", fare: "R26.00", distance: "~30km" },
    ],
    stations: [
      { name: "Atteridgeville", lat: -25.7667, lng: 28.0833 },
      { name: "Mamelodi", lat: -25.7000, lng: 28.3500 },
      { name: "Mabopane", lat: -25.5000, lng: 28.1000 },
      { name: "Ga-Rankuwa", lat: -25.6167, lng: 28.0167 },
    ],
  },
};

// Transportation cards data
const TRANSPORT_METHODS = [
  {
    name: "Gautrain",
    icon: Train,
    color: "from-primary to-primary/80",
    image: "https://images.pexels.com/photos/8348559/pexels-photo-8348559.jpeg",
    fare: "R76-124",
    time: "15-25 mins",
    frequency: "Every 15 mins",
    availability: "5:30 AM - 11 PM",
    pros: ["Fast & Reliable", "Most comfortable", "Set schedules"],
    cons: ["Limited routes", "Higher cost"],
  },
  {
    name: "PUTCO Buses",
    icon: Bus,
    color: "from-accent to-accent/80",
    image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
    fare: "R15-45",
    time: "30-90 mins",
    frequency: "Throughout day",
    availability: "5 AM - 9 PM",
    pros: ["Affordable", "Wide coverage", "SmartTap card"],
    cons: ["Traffic dependent", "Less frequency"],
  },
  {
    name: "Uber & Bolt",
    icon: Car,
    color: "from-secondary to-secondary/80",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
    fare: "R50-150",
    time: "15-30 mins",
    frequency: "On demand",
    availability: "24/7",
    pros: ["Door-to-door", "24/7 service", "Convenient"],
    cons: ["Surge pricing", "Most expensive"],
  },
  {
    name: "Minibus Taxis",
    icon: Bus,
    color: "from-muted-foreground to-muted-foreground/80",
    image: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg",
    fare: "R15-30",
    time: "20-40 mins",
    frequency: "Throughout day",
    availability: "6 AM - 10 PM",
    pros: ["Most affordable", "Frequent", "Routes everywhere"],
    cons: ["Less comfort", "No set schedule"],
  },
];

const UNIVERSITY_ROUTES = [
  {
    university: "University of Pretoria",
    station: "Hatfield Gautrain",
    routes: ["PUTCO Soshanguve", "Gautrain"],
    distance: "5-35 km",
  },
  {
    university: "Wits University",
    station: "Park/Rosebank Gautrain",
    routes: ["Gautrain", "Uber/Bolt"],
    distance: "3-10 km",
  },
  {
    university: "University of Johannesburg",
    station: "Rosebank/Sandton",
    routes: ["Gautrain", "PUTCO"],
    distance: "5-12 km",
  },
  {
    university: "TUT (Tshwane)",
    station: "Pretoria/Centurion",
    routes: ["PUTCO TAM", "Gautrain"],
    distance: "8-15 km",
  },
];

export default function Travel() {
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("soshanguve");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const success = await loadGoogleMapsScript();
      if (!success || !mapRef.current) return;

      const google = (window as any).google;
      if (!google?.maps) return;

      // Center on Pretoria
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -25.7479, lng: 28.2293 },
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: "transit.station.bus",
            elementType: "all",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "transit.station.rail",
            elementType: "all",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();
  }, []);

  // Update markers when region changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const region = PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES];
    if (!region?.stations) return;

    const bounds = new google.maps.LatLngBounds();

    region.stations.forEach((station) => {
      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: mapInstanceRef.current,
        title: station.name,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/bus.png",
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${station.name}</strong><br/>PUTCO ${region.name}</div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: station.lat, lng: station.lng });
    });

    // Add Pretoria CBD marker
    const cbdMarker = new google.maps.Marker({
      position: { lat: -25.7479, lng: 28.1881 },
      map: mapInstanceRef.current,
      title: "Pretoria CBD",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new google.maps.Size(40, 40),
      },
    });
    markersRef.current.push(cbdMarker);
    bounds.extend({ lat: -25.7479, lng: 28.1881 });

    mapInstanceRef.current.fitBounds(bounds);
  }, [selectedRegion, mapLoaded]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg"
            alt="Public Transport"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40" />
          <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Student Travel Guide
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get Around SA
              </h1>
              <p className="text-lg text-muted-foreground">
                Compare transport options, view PUTCO routes, and find the best way to your campus
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Interactive Map Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <MapIcon className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">PUTCO Bus Routes Map</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Route Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Select Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(PUTCO_ROUTES).map(([key, region]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedRegion(key)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedRegion === key
                          ? "bg-primary/10 border-primary"
                          : "bg-card hover:bg-muted border-border"
                      }`}
                    >
                      <div className="font-semibold">{region.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {region.routes.length} routes available
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Map */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div
                    ref={mapRef}
                    className="w-full h-[400px] bg-muted"
                    style={{ minHeight: "400px" }}
                  />
                </Card>
              </div>
            </div>

            {/* Route Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-primary" />
                  {PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES]?.name} Routes & Fares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES]?.routes.map(
                    (route, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="font-medium mb-2">{route.name}</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-primary font-bold">{route.fare}</span>
                          <span className="text-muted-foreground">{route.distance}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Fare Image */}
                {PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES]?.image && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Full Fare Table</h4>
                    <img
                      src={PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES].image}
                      alt={`${PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES].name} fares`}
                      className="w-full max-w-2xl rounded-lg border"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Transport Methods */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">All Transport Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRANSPORT_METHODS.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedTransport === method.name;

                return (
                  <Card
                    key={method.name}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedTransport(isSelected ? null : method.name)
                    }
                  >
                    <div className="relative h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={method.image}
                        alt={method.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-40`} />
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">{method.name}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Fare:</span>{" "}
                          <span className="font-medium">{method.fare}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>{" "}
                          <span className="font-medium">{method.time}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {method.availability}
                      </Badge>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t space-y-2 animate-in fade-in">
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Pros:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {method.pros.map((pro, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  ✓ {pro}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground">Cons:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {method.cons.map((con, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {con}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Gautrain Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Gautrain Network</h2>
            <GautrainInfo showFareCalculator={true} />
          </section>

          {/* University Quick Links */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Campus Connections</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {UNIVERSITY_ROUTES.map((uni) => (
                <Card key={uni.university} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-bold mb-2">{uni.university}</h3>
                    <div className="text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {uni.station}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {uni.routes.map((route, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {route}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Distance: {uni.distance}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold mb-6">Money-Saving Tips</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">PUTCO SmartTap Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Get discounted fares with the SmartTap card system
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Student Discounts</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask about student rates (up to 20% off on Gautrain)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Off-Peak Travel</h4>
                  <p className="text-sm text-muted-foreground">
                    Avoid 7-9 AM and 4-6 PM for cheaper ride-hailing
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Train, 
  Bus, 
  Car, 
  MapPin, 
  Clock,
  ChevronRight,
  Map as MapIcon,
  Navigation,
  Wallet,
  Info,
  ArrowRight,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import GautrainInfo from "@/components/GautrainInfo";
import { loadGoogleMapsScript } from "@/lib/googleMapsConfig";

// Gautrain stations with coordinates
const GAUTRAIN_STATIONS = [
  { name: "OR Tambo International", lat: -26.1367, lng: 28.2311, code: "ORT" },
  { name: "Rhodesfield", lat: -26.1428, lng: 28.2147, code: "RHO" },
  { name: "Marlboro", lat: -26.0917, lng: 28.1106, code: "MAR" },
  { name: "Sandton", lat: -26.1067, lng: 28.0561, code: "SAN" },
  { name: "Rosebank", lat: -26.1467, lng: 28.0436, code: "ROS" },
  { name: "Park", lat: -26.1847, lng: 28.0436, code: "PAR" },
  { name: "Midrand", lat: -25.9947, lng: 28.1264, code: "MID" },
  { name: "Centurion", lat: -25.8589, lng: 28.1897, code: "CEN" },
  { name: "Pretoria", lat: -25.7544, lng: 28.1889, code: "PRE" },
  { name: "Hatfield", lat: -25.7489, lng: 28.2381, code: "HAT" },
];

// PUTCO Routes data with enhanced information
const PUTCO_ROUTES = {
  soshanguve: {
    name: "Soshanguve",
    description: "Routes connecting Soshanguve to Pretoria CBD and surrounds",
    image: "/images/soshanguve-fares-table.jpg",
    color: "bg-primary",
    routes: [
      { id: "S101", from: "Block F4", to: "Zone XX Entrance", fare: "R17.00", time: "~25min" },
      { id: "S102", from: "Block F4", to: "Orchards", fare: "R22.00", time: "~40min" },
      { id: "S103", from: "Block F4", to: "Marabastad", fare: "R24.00", time: "~45min" },
      { id: "S105", from: "Block F4", to: "Centurion Gateway", fare: "R42.00", time: "~60min" },
      { id: "S106", from: "Block F4", to: "Midrand", fare: "R45.00", time: "~75min" },
    ],
    stations: [
      { name: "Soshanguve Block F4", lat: -25.4833, lng: 28.0833 },
      { name: "Soshanguve Block H", lat: -25.5000, lng: 28.1000 },
      { name: "Rosslyn", lat: -25.7167, lng: 28.0667 },
      { name: "Pretoria CBD", lat: -25.7479, lng: 28.1881 },
    ],
  },
  ekangala: {
    name: "Ekangala & Bronkhorstspruit",
    description: "Long-distance routes from Mpumalanga to Pretoria",
    image: "/images/ekangala-fares.jpg",
    color: "bg-accent",
    routes: [
      { id: "E101", from: "Ekangala", to: "Bronkhorstspruit", fare: "R15.00", time: "~20min" },
      { id: "E102", from: "Ekangala", to: "Mamelodi", fare: "R35.00", time: "~50min" },
      { id: "E103", from: "Ekangala", to: "Pretoria CBD", fare: "R45.00", time: "~75min" },
      { id: "E104", from: "Bronkhorstspruit", to: "Pretoria CBD", fare: "R38.00", time: "~60min" },
    ],
    stations: [
      { name: "Ekangala Main", lat: -25.6833, lng: 28.7500 },
      { name: "Bronkhorstspruit", lat: -25.8000, lng: 28.7333 },
      { name: "Mamelodi", lat: -25.7000, lng: 28.3500 },
    ],
  },
  tshwane: {
    name: "Tshwane Metro",
    description: "Routes within Tshwane: Atteridgeville, Mamelodi, Mabopane, Ga-Rankuwa",
    image: "",
    color: "bg-secondary",
    routes: [
      { id: "T101", from: "Atteridgeville", to: "Pretoria CBD", fare: "R18.00", time: "~20min" },
      { id: "T102", from: "Mamelodi", to: "Pretoria CBD", fare: "R22.00", time: "~30min" },
      { id: "T103", from: "Mabopane", to: "Pretoria CBD", fare: "R28.00", time: "~45min" },
      { id: "T104", from: "Ga-Rankuwa", to: "Pretoria CBD", fare: "R26.00", time: "~40min" },
      { id: "T105", from: "Hammanskraal", to: "Pretoria CBD", fare: "R32.00", time: "~55min" },
    ],
    stations: [
      { name: "Atteridgeville", lat: -25.7667, lng: 28.0833 },
      { name: "Mamelodi", lat: -25.7000, lng: 28.3500 },
      { name: "Mabopane", lat: -25.5000, lng: 28.1000 },
      { name: "Ga-Rankuwa", lat: -25.6167, lng: 28.0167 },
      { name: "Hammanskraal", lat: -25.4000, lng: 28.2833 },
    ],
  },
};

// MyCiTi Western Cape Network - Cape Town Bus Rapid Transit System
const MYCITI_WESTERN_CAPE = {
  waterfront: {
    name: "Waterfront & CBD Core",
    description: "Central hub connecting Waterfront, CBD (Civic Centre), and city center",
    color: "bg-blue-500",
    routes: [
      { id: "T01", type: "Trunk", from: "Dunoon", to: "Waterfront", fare: "R18.00", time: "~45min" },
      { id: "T02", type: "Trunk", from: "Atlantis", to: "Civic Centre", fare: "R22.00", time: "~60min" },
      { id: "D05", type: "Direct", from: "Khayelitsha", to: "Civic Centre", fare: "R15.00", time: "~40min" },
      { id: "101", type: "Area", from: "Waterfront", to: "CBD", fare: "R8.00", time: "~10min" },
    ],
    stations: [
      { name: "Civic Centre", lat: -33.9249, lng: 18.4241 },
      { name: "Waterfront", lat: -33.9036, lng: 18.4222 },
      { name: "Convention Centre", lat: -33.9045, lng: 18.4218 },
      { name: "St George's", lat: -33.9105, lng: 18.4175 },
      { name: "Hanover St", lat: -33.9135, lng: 18.4195 },
      { name: "The Castle", lat: -33.9087, lng: 18.4199 },
    ],
  },
  seapoint: {
    name: "Sea Point & Atlantic Seaboard",
    description: "Coastal routes: Sea Point, Camps Bay, Hout Bay, Llandudno",
    color: "bg-cyan-500",
    routes: [
      { id: "T03", type: "Trunk", from: "Camps Bay", to: "Civic Centre", fare: "R18.00", time: "~35min" },
      { id: "T04", type: "Trunk", from: "Hout Bay", to: "Civic Centre", fare: "R22.00", time: "~45min" },
      { id: "109", type: "Area", from: "Sea Point", to: "Camps Bay", fare: "R8.00", time: "~15min" },
    ],
    stations: [
      { name: "Sea Point", lat: -33.9301, lng: 18.3880 },
      { name: "Camps Bay", lat: -33.9446, lng: 18.3767 },
      { name: "Hout Bay", lat: -34.0358, lng: 18.3633 },
      { name: "Imizamo Yethu", lat: -34.0385, lng: 18.3641 },
      { name: "Llandudno", lat: -34.0576, lng: 18.3422 },
    ],
  },
  southernsuburbs: {
    name: "Southern Suburbs (Wynberg, Claremont, Constantia)",
    description: "Routes through Wynberg, Claremont, Constantia, and Retreat",
    color: "bg-green-500",
    routes: [
      { id: "D03", type: "Direct", from: "Wynberg", to: "Civic Centre", fare: "R15.00", time: "~30min" },
      { id: "214", type: "Area", from: "Wynberg", to: "Constantia", fare: "R8.00", time: "~20min" },
      { id: "216", type: "Area", from: "Claremont", to: "Constantia", fare: "R8.00", time: "~15min" },
    ],
    stations: [
      { name: "Wynberg", lat: -34.0156, lng: 18.4724 },
      { name: "Claremont", lat: -33.9649, lng: 18.4622 },
      { name: "Constantia", lat: -34.0231, lng: 18.4064 },
      { name: "Retreat", lat: -34.0775, lng: 18.4539 },
    ],
  },
  falsebay: {
    name: "False Bay Coast (Simon's Town, Fish Hoek, Muizenberg)",
    description: "Scenic routes along False Bay coast to Simon's Town",
    color: "bg-teal-500",
    routes: [
      { id: "234", type: "Area", from: "Muizenberg", to: "Simon's Town", fare: "R12.00", time: "~25min" },
      { id: "235", type: "Area", from: "Fish Hoek", to: "Muizenberg", fare: "R8.00", time: "~15min" },
      { id: "236", type: "Area", from: "Simon's Town", to: "Kalk Bay", fare: "R8.00", time: "~10min" },
    ],
    stations: [
      { name: "Simon's Town", lat: -34.1927, lng: 18.4366 },
      { name: "Fish Hoek", lat: -34.1367, lng: 18.4540 },
      { name: "Muizenberg", lat: -34.0877, lng: 18.4822 },
      { name: "Kalk Bay", lat: -34.1128, lng: 18.4535 },
    ],
  },
  southernfreeway: {
    name: "Khayelitsha & Mitchells Plain",
    description: "High-demand routes connecting Khayelitsha and Mitchells Plain to CBD",
    color: "bg-orange-500",
    routes: [
      { id: "D05", type: "Direct", from: "Khayelitsha East", to: "Civic Centre", fare: "R15.00", time: "~40min" },
      { id: "D06", type: "Direct", from: "Khayelitsha West", to: "Civic Centre", fare: "R15.00", time: "~40min" },
      { id: "D07", type: "Direct", from: "Mitchells Plain East", to: "Civic Centre", fare: "R15.00", time: "~35min" },
      { id: "261", type: "Area", from: "Khayelitsha", to: "Mitchells Plain", fare: "R8.00", time: "~20min" },
    ],
    stations: [
      { name: "Khayelitsha", lat: -34.3534, lng: 18.6458 },
      { name: "Mitchells Plain", lat: -34.1289, lng: 18.6344 },
      { name: "Lentegeur", lat: -34.1753, lng: 18.6264 },
      { name: "Tafelsig", lat: -34.2367, lng: 18.6447 },
    ],
  },
  northernsuburbs: {
    name: "Northern Suburbs (Table View, Milnerton, Parow, Bellville)",
    description: "Routes through northern suburbs and business areas",
    color: "bg-purple-500",
    routes: [
      { id: "T01", type: "Trunk", from: "Dunoon", to: "Table View", fare: "R18.00", time: "~35min" },
      { id: "D08", type: "Direct", from: "Century City", to: "Civic Centre", fare: "R18.00", time: "~30min" },
      { id: "235", type: "Area", from: "Milnerton", to: "Table View", fare: "R8.00", time: "~15min" },
      { id: "246", type: "Area", from: "Bellville", to: "Parow", fare: "R8.00", time: "~10min" },
    ],
    stations: [
      { name: "Table View", lat: -33.8470, lng: 18.4676 },
      { name: "Milnerton", lat: -33.8873, lng: 18.4886 },
      { name: "Parow", lat: -33.8745, lng: 18.6164 },
      { name: "Bellville", lat: -33.9143, lng: 18.6356 },
      { name: "Century City", lat: -33.9289, lng: 18.7386 },
    ],
  },
  atlantis: {
    name: "Atlantis Branch",
    description: "Extended service to Atlantis, Melkbosstrand, and West Coast",
    color: "bg-indigo-500",
    routes: [
      { id: "T02", type: "Trunk", from: "Atlantis", to: "Table View", fare: "R22.00", time: "~60min" },
      { id: "231", type: "Area", from: "Atlantis", to: "Melkbosstrand", fare: "R12.00", time: "~20min" },
      { id: "233", type: "Area", from: "Atlantis", to: "Atlantis Industria", fare: "R8.00", time: "~10min" },
    ],
    stations: [
      { name: "Atlantis", lat: -33.6330, lng: 18.3549 },
      { name: "Melkbosstrand", lat: -33.5873, lng: 18.3434 },
      { name: "Mamre", lat: -33.5965, lng: 18.3748 },
      { name: "Atlantis Industria", lat: -33.6427, lng: 18.3782 },
    ],
  },
};

// Transport comparison data
const TRANSPORT_OPTIONS = [
  {
    name: "Gautrain",
    icon: Train,
    color: "from-primary to-primary/80",
    fareRange: "R76 - R124",
    timeRange: "15-25 min",
    frequency: "Every 12-20 min",
    hours: "5:30 AM - 8:30 PM",
    pros: ["Fastest option", "Air-conditioned", "Reliable schedule"],
    cons: ["Limited stations", "Higher cost"],
  },
  {
    name: "PUTCO Bus",
    icon: Bus,
    color: "from-accent to-accent/80",
    fareRange: "R15 - R45",
    timeRange: "30-90 min",
    frequency: "Peak hours",
    hours: "5:00 AM - 8:00 PM",
    pros: ["Affordable", "Wide coverage", "SmartTap card"],
    cons: ["Traffic dependent", "Peak hours only"],
  },
  {
    name: "Uber/Bolt",
    icon: Car,
    color: "from-muted-foreground to-muted-foreground/80",
    fareRange: "R50 - R200",
    timeRange: "15-45 min",
    frequency: "On demand",
    hours: "24/7",
    pros: ["Door-to-door", "Always available", "Convenient"],
    cons: ["Surge pricing", "Most expensive"],
  },
  {
    name: "Minibus Taxi",
    icon: Bus,
    color: "from-secondary-foreground to-secondary-foreground/80",
    fareRange: "R12 - R35",
    timeRange: "20-60 min",
    frequency: "Throughout day",
    hours: "5:00 AM - 9:00 PM",
    pros: ["Cheapest option", "Very frequent", "Everywhere"],
    cons: ["Crowded", "No fixed schedule"],
  },
];

// University destinations for route planner
const DESTINATIONS = [
  // Gauteng Universities
  { id: "up", name: "University of Pretoria (Hatfield)", lat: -25.7545, lng: 28.2314, nearestGautrain: "Hatfield", transport: "Gautrain" },
  { id: "wits", name: "Wits University", lat: -26.1929, lng: 28.0305, nearestGautrain: "Park", transport: "Gautrain" },
  { id: "uj-auckland", name: "UJ Auckland Park", lat: -26.1836, lng: 28.0061, nearestGautrain: "Park", transport: "Gautrain" },
  { id: "uj-doornfontein", name: "UJ Doornfontein", lat: -26.2022, lng: 28.0553, nearestGautrain: "Park", transport: "Gautrain" },
  { id: "tut-pretoria", name: "TUT Pretoria", lat: -25.7319, lng: 28.1642, nearestGautrain: "Pretoria", transport: "Gautrain" },
  { id: "tut-soshanguve", name: "TUT Soshanguve", lat: -25.4833, lng: 28.0833, nearestGautrain: "Pretoria", transport: "Gautrain" },
  { id: "unisa", name: "UNISA Muckleneuk", lat: -25.7675, lng: 28.1983, nearestGautrain: "Pretoria", transport: "Gautrain" },
  { id: "vut", name: "Vaal University of Technology", lat: -26.7117, lng: 27.8508, nearestGautrain: "Midrand", transport: "Gautrain" },

  // Western Cape Universities
  { id: "uct-campus", name: "UCT Upper Campus (Rondebosch)", lat: -33.9596, lng: 18.4717, nearestMyCiTi: "Civic Centre", transport: "MyCiTi" },
  { id: "uct-health", name: "UCT Health Sciences (City Bowl)", lat: -33.9290, lng: 18.4365, nearestMyCiTi: "Civic Centre", transport: "MyCiTi" },
  { id: "uct-hiddingh", name: "UCT Hiddingh Campus (Gardens)", lat: -33.9515, lng: 18.4422, nearestMyCiTi: "Gardens", transport: "MyCiTi" },
  { id: "stellenbosch", name: "Stellenbosch University", lat: -33.9331, lng: 18.8674, nearestMyCiTi: "Bellville", transport: "MyCiTi" },
  { id: "cput-bellville", name: "CPUT Bellville", lat: -33.9217, lng: 18.6449, nearestMyCiTi: "Civic Centre", transport: "MyCiTi" },
  { id: "cput-downtown", name: "CPUT Downtown Campus", lat: -33.9100, lng: 18.4261, nearestMyCiTi: "Civic Centre", transport: "MyCiTi" },
  { id: "dut-cape", name: "Durban University of Technology Cape Campus", lat: -34.1200, lng: 18.6100, nearestMyCiTi: "Mitchells Plain", transport: "MyCiTi" },
];

// Origin locations
const ORIGINS = [
  // Gauteng Origins
  { id: "sosh-f4", name: "Soshanguve Block F4", region: "soshanguve" },
  { id: "sosh-h", name: "Soshanguve Block H", region: "soshanguve" },
  { id: "ekangala", name: "Ekangala", region: "ekangala" },
  { id: "bronk", name: "Bronkhorstspruit", region: "ekangala" },
  { id: "atteridge", name: "Atteridgeville", region: "tshwane" },
  { id: "mamelodi", name: "Mamelodi", region: "tshwane" },
  { id: "mabopane", name: "Mabopane", region: "tshwane" },
  { id: "ga-rankuwa", name: "Ga-Rankuwa", region: "tshwane" },
  { id: "sandton", name: "Sandton", region: "gautrain" },
  { id: "midrand", name: "Midrand", region: "gautrain" },
  { id: "centurion", name: "Centurion", region: "gautrain" },

  // Western Cape Origins
  { id: "khayelitsha", name: "Khayelitsha", region: "southernfreeway" },
  { id: "mitchells-plain", name: "Mitchells Plain", region: "southernfreeway" },
  { id: "atlantis", name: "Atlantis", region: "atlantis" },
  { id: "table-view", name: "Table View", region: "northernsuburbs" },
  { id: "bellville", name: "Bellville", region: "northernsuburbs" },
  { id: "wynberg", name: "Wynberg", region: "southernsuburbs" },
  { id: "hout-bay", name: "Hout Bay", region: "seapoint" },
  { id: "simon-town", name: "Simon's Town", region: "falsebay" },
  { id: "muizenberg", name: "Muizenberg", region: "falsebay" },
  { id: "sea-point", name: "Sea Point", region: "seapoint" },
  { id: "waterfront", name: "Waterfront", region: "waterfront" },
];

export default function Travel() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [transportSystem, setTransportSystem] = useState<"gautrain" | "putco" | "myciti">("myciti");
  const [activeTab, setActiveTab] = useState("map");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showGautrain, setShowGautrain] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  // Route Planner State
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeResult, setRouteResult] = useState<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const success = await loadGoogleMapsScript();
      if (!success || !mapRef.current) return;

      const google = (window as any).google;
      if (!google?.maps) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -33.9249, lng: 18.4241 },
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: "transit.station.bus", elementType: "all", stylers: [{ visibility: "on" }] },
          { featureType: "transit.station.rail", elementType: "all", stylers: [{ visibility: "on" }] },
        ],
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();
  }, []);

  // Update map markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Clear existing markers and polylines
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // Add Gautrain stations if enabled
    if (showGautrain) {
      GAUTRAIN_STATIONS.forEach((station) => {
        const marker = new google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map: mapInstanceRef.current,
          title: station.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#059669",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 10,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>🚆 ${station.name}</strong><br/><span class="text-xs">Gautrain Station</span></div>`,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: station.lat, lng: station.lng });
      });

      // Draw Gautrain line
      const gautrainPath = GAUTRAIN_STATIONS.map((s) => ({ lat: s.lat, lng: s.lng }));
      const gautrainLine = new google.maps.Polyline({
        path: gautrainPath,
        geodesic: true,
        strokeColor: "#059669",
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      gautrainLine.setMap(mapInstanceRef.current);
      polylinesRef.current.push(gautrainLine);
    }

    // Add MyCiTi Western Cape stations
    if (transportSystem === "myciti") {
      // Show all regions or just the selected region
      const regionsToShow = showAllRoutes
        ? Object.entries(MYCITI_WESTERN_CAPE)
        : selectedRegion === "all"
          ? Object.entries(MYCITI_WESTERN_CAPE)
          : [[selectedRegion, MYCITI_WESTERN_CAPE[selectedRegion as keyof typeof MYCITI_WESTERN_CAPE]]];

      regionsToShow.forEach(([regionKey, region]) => {
        if (!region?.stations) return;

        const isHighlighted = selectedRegion === regionKey || selectedRegion === "all";
        const fillColor = isHighlighted ? "#3b82f6" : "#9ca3af";
        const scale = isHighlighted ? 8 : 6;

        region.stations.forEach((station) => {
          const marker = new google.maps.Marker({
            position: { lat: station.lat, lng: station.lng },
            map: mapInstanceRef.current,
            title: station.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: fillColor,
              fillOpacity: isHighlighted ? 1 : 0.6,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: scale,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>🚌 ${station.name}</strong><br/><span class="text-xs">MyCiTi ${region.name}</span></div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: station.lat, lng: station.lng });
        });
      });
    } else {
      // Add PUTCO stations - show all regions or just the selected region
      const regionsToShow = showAllRoutes
        ? Object.entries(PUTCO_ROUTES)
        : selectedRegion === "all"
          ? Object.entries(PUTCO_ROUTES)
          : [[selectedRegion, PUTCO_ROUTES[selectedRegion as keyof typeof PUTCO_ROUTES]]];

      regionsToShow.forEach(([regionKey, region]) => {
        if (!region?.stations) return;

        const isHighlighted = selectedRegion === regionKey || selectedRegion === "all";
        const fillColor = isHighlighted ? "#f59e0b" : "#fed7aa";
        const fillOpacity = isHighlighted ? 1 : 0.6;

        region.stations.forEach((station) => {
          const marker = new google.maps.Marker({
            position: { lat: station.lat, lng: station.lng },
            map: mapInstanceRef.current,
            title: station.name,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 6,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>🚌 ${station.name}</strong><br/><span class="text-xs">PUTCO ${region.name}</span></div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: station.lat, lng: station.lng });
        });
      });
    }

    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [selectedRegion, mapLoaded, showGautrain, transportSystem, showAllRoutes]);

  // Route planner logic
  const calculateRoute = () => {
    if (!origin || !destination) return;

    const originData = ORIGINS.find((o) => o.id === origin);
    const destData = DESTINATIONS.find((d) => d.id === destination);

    if (!originData || !destData) return;

    // Generate route recommendations
    const recommendations = [];

    // Check if both origin and destination are in Western Cape (MyCiTi areas)
    const isWesternCapeRoute = originData.region in MYCITI_WESTERN_CAPE && destData.transport === "MyCiTi";

    if (isWesternCapeRoute) {
      // MyCiTi option
      const originRegion = MYCITI_WESTERN_CAPE[originData.region as keyof typeof MYCITI_WESTERN_CAPE];
      recommendations.push({
        type: "MyCiTi Bus",
        icon: Bus,
        steps: [
          `Board MyCiTi bus from ${originData.name}`,
          `Travel via ${originRegion.name}`,
          `Arrive at ${destData.nearestMyCiTi || destData.name}`,
        ],
        estimatedCost: "R15 - R22",
        estimatedTime: "35 - 50 min",
        pros: ["Most affordable", "Regular service"],
      });
    } else if (originData.region !== "gautrain" && originData.region in PUTCO_ROUTES) {
      // PUTCO option
      const region = PUTCO_ROUTES[originData.region as keyof typeof PUTCO_ROUTES];
      if (region) {
        recommendations.push({
          type: "PUTCO Bus",
          icon: Bus,
          steps: [
            `Take PUTCO ${region.name} bus to Pretoria CBD`,
            destData.nearestGautrain ? `Transfer to Gautrain at Pretoria → ${destData.nearestGautrain}` : "Walk or taxi to campus",
          ],
          estimatedCost: "R25 - R50",
          estimatedTime: "60 - 90 min",
          pros: ["Most affordable"],
        });
      }
    }

    // Gautrain option (if applicable)
    if (destData.transport === "Gautrain" || destData.nearestGautrain) {
      recommendations.push({
        type: "Gautrain",
        icon: Train,
        steps: [
          originData.region === "gautrain"
            ? `Board Gautrain at ${originData.name}`
            : `Get to nearest Gautrain station (taxi/bus)`,
          `Take Gautrain to ${destData.nearestGautrain}`,
          "Walk or taxi to campus",
        ],
        estimatedCost: "R80 - R150",
        estimatedTime: "30 - 60 min",
        pros: ["Fastest option"],
      });
    }

    // Uber option
    recommendations.push({
      type: "Uber/Bolt",
      icon: Car,
      steps: ["Request ride from your location", "Direct trip to campus"],
      estimatedCost: "R100 - R300",
      estimatedTime: "30 - 60 min",
      pros: ["Door-to-door", "No transfers"],
    });

    setRouteResult({
      origin: originData.name,
      destination: destData.name,
      recommendations,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Navigation className="w-3 h-3 mr-1" />
                Student Travel Guide
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Navigate SA <span className="text-primary">Smarter</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Find the best routes to your campus. Compare Gautrain, PUTCO buses, and more with real fares and times.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setActiveTab("planner")}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Plan My Route
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab("map")}>
                  <MapIcon className="w-4 h-4 mr-2" />
                  View Map
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-4 mx-auto">
              <TabsTrigger value="map">
                <MapIcon className="w-4 h-4 mr-2 hidden sm:inline" />
                Map
              </TabsTrigger>
              <TabsTrigger value="planner">
                <Navigation className="w-4 h-4 mr-2 hidden sm:inline" />
                Planner
              </TabsTrigger>
              <TabsTrigger value="fares">
                <Wallet className="w-4 h-4 mr-2 hidden sm:inline" />
                Fares
              </TabsTrigger>
              <TabsTrigger value="gautrain">
                <Train className="w-4 h-4 mr-2 hidden sm:inline" />
                Gautrain
              </TabsTrigger>
            </TabsList>

            {/* Map Tab */}
            <TabsContent value="map" className="space-y-4">
              <div className="grid lg:grid-cols-5 gap-4">
                {/* Sidebar Controls */}
                <Card className="lg:col-span-1 h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filter Routes</CardTitle>
                    <CardDescription className="text-xs">Tap to view by region</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Transport System Toggle */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant={transportSystem === "myciti" ? "default" : "outline"}
                        className="flex-1 h-9 text-xs font-semibold"
                        onClick={() => {
                          setTransportSystem("myciti");
                          setShowAllRoutes(true);
                          setSelectedRegion("all");
                        }}
                      >
                        <Bus className="w-3 h-3 mr-1" />
                        MyCiTi
                      </Button>
                      <Button
                        variant={transportSystem === "putco" ? "default" : "outline"}
                        className="flex-1 h-9 text-xs font-semibold"
                        onClick={() => {
                          setTransportSystem("putco");
                          setShowAllRoutes(true);
                          setSelectedRegion("all");
                        }}
                      >
                        <Bus className="w-3 h-3 mr-1" />
                        PUTCO
                      </Button>
                    </div>

                    {/* Gautrain Toggle */}
                    <Button
                      variant={showGautrain ? "default" : "outline"}
                      className="w-full justify-center h-9 text-xs font-semibold"
                      onClick={() => setShowGautrain(!showGautrain)}
                    >
                      <Train className="w-3 h-3 mr-2" />
                      Gautrain Network
                    </Button>

                    {/* View All Button */}
                    <div className="border-t pt-3">
                      <Button
                        variant={selectedRegion === "all" ? "secondary" : "outline"}
                        className="w-full justify-start mb-3 h-10 font-semibold text-sm"
                        onClick={() => {
                          setSelectedRegion("all");
                          setShowAllRoutes(true);
                        }}
                      >
                        <MapIcon className="w-4 h-4 mr-2" />
                        View All Routes
                      </Button>

                      <p className="text-xs font-medium mb-2 text-muted-foreground px-1">
                        {transportSystem === "myciti" ? "MyCiTi Regions" : "PUTCO Regions"}
                      </p>
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {transportSystem === "myciti" ? (
                          Object.entries(MYCITI_WESTERN_CAPE).map(([key, region]) => (
                            <Button
                              key={key}
                              variant={selectedRegion === key ? "secondary" : "ghost"}
                              className="w-full justify-start text-xs h-8"
                              onClick={() => {
                                setSelectedRegion(key);
                                setShowAllRoutes(false);
                              }}
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                              <span className="truncate">{region.name}</span>
                            </Button>
                          ))
                        ) : (
                          Object.entries(PUTCO_ROUTES).map(([key, region]) => (
                            <Button
                              key={key}
                              variant={selectedRegion === key ? "secondary" : "ghost"}
                              className="w-full justify-start text-xs h-8"
                              onClick={() => {
                                setTransportSystem("putco");
                                setSelectedRegion(key);
                                setShowAllRoutes(false);
                              }}
                            >
                              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                              <span className="truncate">{region.name}</span>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map */}
                <Card className="lg:col-span-4 overflow-hidden shadow-lg">
                  <div ref={mapRef} className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200" />
                </Card>
              </div>

              {/* Legend */}
              <Card className="bg-white border shadow">
                <CardContent className="pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Legend</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow" />
                      <span className="text-sm font-medium">MyCiTi Station</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow" />
                      <span className="text-sm font-medium">PUTCO Stop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600 shadow" />
                      <span className="text-sm font-medium">Gautrain</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Route Planner Tab */}
            <TabsContent value="planner" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    Route Planner
                  </CardTitle>
                  <CardDescription>
                    Select your origin and destination to get transport recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Where are you coming from?</Label>
                      <Select value={origin} onValueChange={setOrigin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORIGINS.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Where are you going?</Label>
                      <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campus" />
                        </SelectTrigger>
                        <SelectContent>
                          {DESTINATIONS.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                {d.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={calculateRoute} className="w-full sm:w-auto">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Get Route Options
                  </Button>

                  {/* Results */}
                  {routeResult && (
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="font-semibold text-lg">
                        {routeResult.origin} → {routeResult.destination}
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {routeResult.recommendations.map((rec: any, idx: number) => {
                          const IconComponent = rec.icon;
                          return (
                            <Card key={idx} className="border-2 hover:border-primary transition-colors">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <IconComponent className="w-5 h-5 text-primary" />
                                  {rec.type}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="space-y-1">
                                  {rec.steps.map((step: string, stepIdx: number) => (
                                    <div key={stepIdx} className="flex items-start gap-2 text-sm">
                                      <span className="text-primary font-medium">{stepIdx + 1}.</span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t">
                                  <div>
                                    <p className="text-muted-foreground">Cost</p>
                                    <p className="font-semibold text-primary">{rec.estimatedCost}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-muted-foreground">Time</p>
                                    <p className="font-semibold">{rec.estimatedTime}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {rec.pros.map((pro: string, proIdx: number) => (
                                    <Badge key={proIdx} variant="secondary" className="text-xs">
                                      ✓ {pro}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transport Comparison */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TRANSPORT_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Card key={option.name} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-2`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-base">{option.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fare</span>
                          <span className="font-medium">{option.fareRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-medium">{option.timeRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hours</span>
                          <span className="font-medium text-xs">{option.hours}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Fares Tab */}
            <TabsContent value="fares" className="space-y-6">
              {/* MyCiTi Fares */}
              <div>
                <h3 className="text-lg font-semibold mb-4">MyCiTi Western Cape Network</h3>
                <div className="grid lg:grid-cols-3 gap-6">
                  {Object.entries(MYCITI_WESTERN_CAPE).map(([key, region]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bus className="w-5 h-5 text-blue-500" />
                          {region.name}
                        </CardTitle>
                        <CardDescription>{region.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {region.routes.map((route) => (
                          <div
                            key={route.id}
                            className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {route.id} ({route.type})
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <ArrowRight className="w-3 h-3 mx-1" />
                                {route.from} → {route.to}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-500">{route.fare}</p>
                              <p className="text-xs text-muted-foreground">{route.time}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* PUTCO Fares */}
              <div>
                <h3 className="text-lg font-semibold mb-4">PUTCO Network (Gauteng)</h3>
                <div className="grid lg:grid-cols-3 gap-6">
                  {Object.entries(PUTCO_ROUTES).map(([key, region]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bus className="w-5 h-5 text-accent" />
                          {region.name}
                        </CardTitle>
                        <CardDescription>{region.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {region.routes.map((route) => (
                          <div
                            key={route.id}
                            className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm">{route.from}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <ArrowRight className="w-3 h-3 mx-1" />
                                {route.to}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{route.fare}</p>
                              <p className="text-xs text-muted-foreground">{route.time}</p>
                            </div>
                          </div>
                        ))}

                        {region.image && (
                          <Button variant="outline" className="w-full mt-2" asChild>
                            <a href={region.image} target="_blank" rel="noopener noreferrer">
                              View Full Fare Table
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Lightbulb className="w-5 h-5" />
                    Money-Saving Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Get a SmartTap Card</p>
                        <p className="text-sm text-muted-foreground">Save up to 15% on PUTCO fares with prepaid trips</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Travel Off-Peak</p>
                        <p className="text-sm text-muted-foreground">Gautrain is cheaper outside 6-8 AM and 4-6 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Share Rides</p>
                        <p className="text-sm text-muted-foreground">Split Uber/Bolt costs with classmates going the same way</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gautrain Tab */}
            <TabsContent value="gautrain">
              <GautrainInfo showFareCalculator={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Train, MapPin, Clock, DollarSign, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Gautrain station data from the 2025 fare guide
const GAUTRAIN_STATIONS = [
  { 
    name: "O.R. Tambo International", 
    code: "ORT",
    line: "Airport Line",
    zone: 1,
    nearbyUniversities: [],
    parkingAvailable: false,
  },
  { 
    name: "Rhodesfield", 
    code: "RHO",
    line: "Airport Line",
    zone: 2,
    nearbyUniversities: [],
    parkingAvailable: true,
  },
  { 
    name: "Marlboro", 
    code: "MAR",
    line: "North-South Line",
    zone: 3,
    nearbyUniversities: [],
    parkingAvailable: true,
  },
  { 
    name: "Sandton", 
    code: "SAN",
    line: "North-South Line",
    zone: 4,
    nearbyUniversities: ["WITS (8km)", "UJ (12km)"],
    parkingAvailable: true,
  },
  { 
    name: "Rosebank", 
    code: "ROS",
    line: "North-South Line",
    zone: 5,
    nearbyUniversities: ["WITS (4km)", "UJ Auckland Park (6km)"],
    parkingAvailable: true,
  },
  { 
    name: "Park Station", 
    code: "PAR",
    line: "North-South Line",
    zone: 6,
    nearbyUniversities: ["WITS (2km)", "UJ Doornfontein (3km)"],
    parkingAvailable: false,
  },
  { 
    name: "Midrand", 
    code: "MID",
    line: "North-South Line",
    zone: 7,
    nearbyUniversities: ["Midrand Graduate Institute (2km)"],
    parkingAvailable: true,
  },
  { 
    name: "Centurion", 
    code: "CEN",
    line: "North-South Line",
    zone: 8,
    nearbyUniversities: ["TUT (5km)"],
    parkingAvailable: true,
  },
  { 
    name: "Pretoria", 
    code: "PTA",
    line: "North-South Line",
    zone: 9,
    nearbyUniversities: ["University of Pretoria (4km)", "TUT (3km)", "UNISA (6km)"],
    parkingAvailable: true,
  },
  { 
    name: "Hatfield", 
    code: "HAT",
    line: "North-South Line",
    zone: 10,
    nearbyUniversities: ["University of Pretoria (1km)"],
    parkingAvailable: true,
  },
];

// 2025 Fare matrix (single trip prices in ZAR)
const FARE_MATRIX: Record<string, Record<string, number>> = {
  "ORT": { "ORT": 0, "RHO": 76, "MAR": 92, "SAN": 108, "ROS": 124, "PAR": 140, "MID": 108, "CEN": 140, "PTA": 156, "HAT": 172 },
  "RHO": { "ORT": 76, "RHO": 0, "MAR": 76, "SAN": 92, "ROS": 108, "PAR": 124, "MID": 92, "CEN": 124, "PTA": 140, "HAT": 156 },
  "MAR": { "ORT": 92, "RHO": 76, "MAR": 0, "SAN": 76, "ROS": 92, "PAR": 108, "MID": 76, "CEN": 108, "PTA": 124, "HAT": 140 },
  "SAN": { "ORT": 108, "RHO": 92, "MAR": 76, "SAN": 0, "ROS": 76, "PAR": 92, "MID": 92, "CEN": 108, "PTA": 124, "HAT": 140 },
  "ROS": { "ORT": 124, "RHO": 108, "MAR": 92, "SAN": 76, "ROS": 0, "PAR": 76, "MID": 108, "CEN": 124, "PTA": 140, "HAT": 156 },
  "PAR": { "ORT": 140, "RHO": 124, "MAR": 108, "SAN": 92, "ROS": 76, "PAR": 0, "MID": 124, "CEN": 140, "PTA": 156, "HAT": 172 },
  "MID": { "ORT": 108, "RHO": 92, "MAR": 76, "SAN": 92, "ROS": 108, "PAR": 124, "MID": 0, "CEN": 76, "PTA": 92, "HAT": 108 },
  "CEN": { "ORT": 140, "RHO": 124, "MAR": 108, "SAN": 108, "ROS": 124, "PAR": 140, "MID": 76, "CEN": 0, "PTA": 76, "HAT": 92 },
  "PTA": { "ORT": 156, "RHO": 140, "MAR": 124, "SAN": 124, "ROS": 140, "PAR": 156, "MID": 92, "CEN": 76, "PTA": 0, "HAT": 76 },
  "HAT": { "ORT": 172, "RHO": 156, "MAR": 140, "SAN": 140, "ROS": 156, "PAR": 172, "MID": 108, "CEN": 92, "PTA": 76, "HAT": 0 },
};

interface GautrainInfoProps {
  showFareCalculator?: boolean;
  highlightUniversity?: string;
}

export const GautrainInfo = ({ showFareCalculator = true, highlightUniversity }: GautrainInfoProps) => {
  const [selectedFrom, setSelectedFrom] = useState<string>("");
  const [selectedTo, setSelectedTo] = useState<string>("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  const calculateFare = () => {
    if (!selectedFrom || !selectedTo) return null;
    return FARE_MATRIX[selectedFrom]?.[selectedTo] || null;
  };

  const fare = calculateFare();

  // Find stations near the highlighted university
  const relevantStations = highlightUniversity
    ? GAUTRAIN_STATIONS.filter(s => 
        s.nearbyUniversities.some(u => 
          u.toLowerCase().includes(highlightUniversity.toLowerCase())
        )
      )
    : GAUTRAIN_STATIONS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Train className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Gautrain Information</h3>
          <p className="text-sm text-muted-foreground">2025 Fares & Station Guide</p>
        </div>
      </div>

      {/* Fare Calculator */}
      {showFareCalculator && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Fare Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                <select
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-white"
                >
                  <option value="">Select station</option>
                  {GAUTRAIN_STATIONS.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                <select
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-white"
                >
                  <option value="">Select station</option>
                  {GAUTRAIN_STATIONS.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {fare !== null && (
              <div className="p-4 bg-white rounded-lg border border-blue-200 text-center">
                <p className="text-sm text-muted-foreground mb-1">Single Trip Fare</p>
                <p className="text-3xl font-bold text-blue-600">R{fare}</p>
                <p className="text-xs text-muted-foreground mt-1">Valid for 2025</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stations List */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {highlightUniversity ? `Stations near ${highlightUniversity}` : "All Stations"}
        </h4>
        
        {relevantStations.map((station) => (
          <Collapsible
            key={station.code}
            open={expandedStation === station.code}
            onOpenChange={(open) => setExpandedStation(open ? station.code : null)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Train className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{station.name}</p>
                      <p className="text-xs text-muted-foreground">{station.line}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {station.parkingAvailable && (
                      <Badge variant="secondary" className="text-xs">P+R</Badge>
                    )}
                    {station.nearbyUniversities.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {station.nearbyUniversities.length} Unis
                      </Badge>
                    )}
                    {expandedStation === station.code ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                  <div className="pt-3 space-y-2">
                    {station.nearbyUniversities.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Nearby Universities</p>
                        <div className="flex flex-wrap gap-1">
                          {station.nearbyUniversities.map((uni, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {uni}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No universities within 10km</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        5:30 AM - 8:30 PM
                      </span>
                      {station.parkingAvailable && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Park & Ride available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          Fares shown are for single trips using a Gold Card. Peak hours (6-9 AM, 4-7 PM weekdays) may have higher demand. 
          Students can get discounted monthly passes at stations.
        </p>
      </div>
    </div>
  );
};

export default GautrainInfo;

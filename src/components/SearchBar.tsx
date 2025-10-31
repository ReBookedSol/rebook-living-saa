import { useState } from "react";
import { Search, MapPin, GraduationCap, DollarSign, CheckCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

const SA_UNIVERSITIES = [
  "All Universities",
  "University of Cape Town",
  "University of Johannesburg",
  "University of Pretoria",
  "Stellenbosch University",
  "University of KwaZulu-Natal",
  "University of the Witwatersrand",
  "Rhodes University",
  "North-West University",
  "Tshwane University of Technology",
  "Cape Peninsula University of Technology",
];

const SearchBar = ({ compact = false }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [university, setUniversity] = useState("All Universities");
  const [maxCost, setMaxCost] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const AMENITIES = ["WiFi", "Laundry", "Study Room", "Parking", "Security"];
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (university !== "All Universities") params.set("university", university);
    if (maxCost) params.set("maxCost", maxCost);
    if (nsfasOnly) params.set("nsfas", "true");
    if (minRating > 0) params.set("minRating", String(minRating));
    if (amenities.length > 0) params.set("amenities", amenities.join(","));

    navigate(`/browse?${params.toString()}`);
  };

  if (compact) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-md border">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, city, or area..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary-hover">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Search
          </label>
          <Input
            placeholder="Name, city, or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className={`flex items-end md:items-center gap-2 md:gap-4 md:col-span-2 transition-all duration-500 ${showAdvanced ? 'md:justify-end' : 'md:justify-center'}`}>
          <Button onClick={() => setShowAdvanced((v) => !v)} variant="outline" className="inline-flex">
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </Button>

          <div className="flex-1">
            <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary-hover">
              <Search className="mr-2 h-4 w-4" />
              Search Accommodation
            </Button>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transform origin-top transition-all duration-300 ${showAdvanced ? 'max-h-[400px] scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'} md:max-h-full md:scale-y-100 md:opacity-100`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              University
            </label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SA_UNIVERSITIES.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Max Monthly Cost (ZAR)
            </label>
            <div className="px-2">
              <Slider
                value={[parseInt(maxCost || "0") || 0]}
                onValueChange={(v) => setMaxCost(String(v[0]))}
                max={10000}
                step={100}
              />
              <div className="text-xs text-muted-foreground mt-2">Up to R {maxCost || 0}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Min Rating</label>
            <Select value={String(minRating)} onValueChange={(v) => setMinRating(parseFloat(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="3">3.0+</SelectItem>
                <SelectItem value="4">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((a) => (
                <div key={a} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${a}`}
                    checked={amenities.includes(a)}
                    onCheckedChange={(checked) => {
                      if (checked) setAmenities([...amenities, a]);
                      else setAmenities(amenities.filter((x) => x !== a));
                    }}
                  />
                  <label htmlFor={`amenity-${a}`} className="text-sm">{a}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nsfas"
                checked={nsfasOnly}
                onCheckedChange={(checked) => setNsfasOnly(checked as boolean)}
              />
              <label
                htmlFor="nsfas"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-primary" />
                NSFAS Accredited Only
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

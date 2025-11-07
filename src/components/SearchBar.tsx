import { useState } from "react";
import { Search, MapPin, GraduationCap, DollarSign, CheckCircle, ChevronsUpDown, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SA_UNIVERSITIES = [
  "All Universities",
  "University of Cape Town",
  "University of the Witwatersrand",
  "University of Johannesburg",
  "University of Pretoria",
  "Stellenbosch University",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "North-West University",
  "Tshwane University of Technology",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "University of the Western Cape",
  "University of Fort Hare",
  "University of the Free State",
  "University of Zululand",
  "Walter Sisulu University",
  "Nelson Mandela University",
  "Mangosuthu University of Technology",
  "Sol Plaatje University",
  "University of South Africa (UNISA)",
  "Central University of Technology",
  "Vaal University of Technology",
  "University of Limpopo",
  "University of Mpumalanga",
  "Sefako Makgatho Health Sciences University",
];

const SA_PROVINCES = [
  "All Provinces",
  "Western Cape",
  "Eastern Cape",
  "Northern Cape",
  "Free State",
  "KwaZulu-Natal",
  "North West",
  "Gauteng",
  "Mpumalanga",
  "Limpopo",
];

const SearchBar = ({ compact = false }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [university, setUniversity] = useState("All Universities");
  const [province, setProvince] = useState("All Provinces");
  const [maxCost, setMaxCost] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const AMENITIES = [
    "WiFi/Internet",
    "Laundry Facilities",
    "Study Room",
    "Parking",
    "24/7 Security",
    "CCTV Surveillance",
    "Kitchen Facilities",
    "Furnished",
    "Gym/Fitness Center",
    "Swimming Pool",
    "Cleaning Services",
    "Air Conditioning",
    "Heating",
    "Hot Water",
    "Electricity Included",
    "Water Included",
    "Common Area/Lounge",
    "Garden/Outdoor Space",
    "Bike Storage",
    "Pet Friendly",
    "Wheelchair Access",
    "Fire Safety Equipment",
    "Medical Facilities Nearby",
    "Public Transport Access",
  ];
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (university !== "All Universities") params.set("university", university);
    if (province && province !== "All Provinces") params.set("province", province);
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

        <div className={`flex flex-col sm:flex-row items-stretch sm:items-end md:items-center gap-2 md:gap-4 md:col-span-2 transition-all duration-500 ${showAdvanced ? 'md:justify-end' : 'md:justify-center'}`}>
          <Button onClick={() => setShowAdvanced((v) => !v)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-3 py-2">
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </Button>

          <Button onClick={handleSearch} className="w-full sm:flex-1 bg-primary hover:bg-primary-hover text-sm sm:text-base">
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Search Accommodation</span>
            <span className="sm:hidden">Search</span>
          </Button>
        </div>
      </div>

      <div className={`overflow-hidden transform origin-top transition-all duration-300 ${showAdvanced ? 'max-h-[400px] scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}>
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
            <label className="text-sm font-medium">Province</label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SA_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Popover open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={amenitiesOpen}
                  className="w-full justify-between text-left font-normal"
                >
                  {amenities.length > 0
                    ? `${amenities.length} selected`
                    : "Select amenities"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 pointer-events-auto" align="start">
                <ScrollArea className="h-[300px] w-full">
                  <div className="p-4 space-y-2">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAmenities([...amenities, amenity]);
                            } else {
                              setAmenities(amenities.filter((x) => x !== amenity));
                            }
                          }}
                        />
                        <label
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
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

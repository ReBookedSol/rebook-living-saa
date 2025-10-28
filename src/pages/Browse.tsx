import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("rating");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [nsfasOnly, setNsfasOnly] = useState(searchParams.get("nsfas") === "true");

  const { data: accommodations, isLoading } = useQuery({
    queryKey: ["accommodations", searchParams.toString(), sortBy, priceRange, selectedGender, nsfasOnly],
    queryFn: async () => {
      let query = supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active");

      const location = searchParams.get("location");
      const university = searchParams.get("university");
      const maxCost = searchParams.get("maxCost");

      if (location) {
        query = query.or(`city.ilike.%${location}%,address.ilike.%${location}%`);
      }

      if (university) {
        query = query.eq("university", university);
      }

      if (maxCost) {
        query = query.lte("monthly_cost", parseInt(maxCost));
      }

      if (nsfasOnly) {
        query = query.eq("nsfas_accredited", true);
      }

      query = query.gte("monthly_cost", priceRange[0]).lte("monthly_cost", priceRange[1]);

      if (selectedGender.length > 0) {
        query = query.in("gender_policy", selectedGender);
      }

      if (sortBy === "price-asc") {
        query = query.order("monthly_cost", { ascending: true });
      } else if (sortBy === "price-desc") {
        query = query.order("monthly_cost", { ascending: false });
      } else {
        query = query.order("rating", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const [showFilters, setShowFilters] = useState(true);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold mb-4">Browse Accommodation</h1>
            <div className={`lg:hidden transition-all duration-500 flex ${showFilters ? 'justify-end' : 'justify-center'}`}>
              <button onClick={() => setShowFilters((v) => !v)} className="text-sm text-primary underline">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
          <SearchBar compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className={`bg-card p-6 rounded-lg border sticky top-24 transition-all duration-300 ${showFilters ? 'opacity-100 max-h-[1200px]' : 'opacity-0 max-h-0 overflow-hidden lg:overflow-visible lg:opacity-100 lg:max-h-[1200px]'}`}>
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              {/* Sort */}
              <div className="mb-6">
                <Label className="mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="mb-2 block">
                  Price Range: R{priceRange[0]} - R{priceRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={20000}
                  step={500}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>

              {/* NSFAS Filter */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nsfas-filter"
                    checked={nsfasOnly}
                    onCheckedChange={(checked) => setNsfasOnly(checked as boolean)}
                  />
                  <Label htmlFor="nsfas-filter" className="cursor-pointer">
                    NSFAS Accredited Only
                  </Label>
                </div>
              </div>

              {/* Gender Policy */}
              <div className="mb-6">
                <Label className="mb-2 block">Gender Policy</Label>
                <div className="space-y-2">
                  {["Mixed", "Male Only", "Female Only"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox
                        id={gender}
                        checked={selectedGender.includes(gender)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGender([...selectedGender, gender]);
                          } else {
                            setSelectedGender(selectedGender.filter((g) => g !== gender));
                          }
                        }}
                      />
                      <Label htmlFor={gender} className="cursor-pointer">
                        {gender}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : accommodations && accommodations.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Found {accommodations.length} properties
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accommodations.map((listing) => (
                    <AccommodationCard
                      key={listing.id}
                      id={listing.id}
                      propertyName={listing.property_name}
                      type={listing.type}
                      university={listing.university || ""}
                      address={listing.address}
                      city={listing.city || ""}
                      monthlyCost={listing.monthly_cost || 0}
                      rating={listing.rating || 0}
                      imageUrl={listing.image_urls?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"}
                      nsfasAccredited={listing.nsfas_accredited || false}
                      genderPolicy={listing.gender_policy || ""}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No properties found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;

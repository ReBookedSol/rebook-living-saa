import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Info } from "lucide-react";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const university = searchParams.get("university") || "";
  const maxCost = searchParams.get("maxCost") || "";
  
  const [sortBy, setSortBy] = useState("rating");
  const [priceRange, setPriceRange] = useState([10000]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  const { data: accommodations, isLoading } = useQuery({
    queryKey: ["accommodations", location, university, maxCost, nsfasOnly, sortBy, priceRange, selectedGender],
    queryFn: async () => {
      let query = supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active");

      if (location) {
        query = query.or(`city.ilike.%${location}%,province.ilike.%${location}%,address.ilike.%${location}%`);
      }

      if (university) {
        query = query.eq("university", university);
      }

      if (maxCost) {
        query = query.lte("monthly_cost", parseInt(maxCost));
      }

      if (priceRange[0] < 10000) {
        query = query.lte("monthly_cost", priceRange[0]);
      }

      if (nsfasOnly) {
        query = query.eq("nsfas_accredited", true);
      }

      if (selectedGender) {
        query = query.eq("gender_policy", selectedGender);
      }

      if (sortBy === "price-low") {
        query = query.order("monthly_cost", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("monthly_cost", { ascending: false });
      } else if (sortBy === "rating") {
        query = query.order("rating", { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const totalPages = accommodations ? Math.ceil(accommodations.length / ITEMS_PER_PAGE) : 0;
  const paginatedAccommodations = accommodations?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPaginationItems = () => {
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === 2 && showEllipsisStart) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      } else if (i === totalPages - 1 && showEllipsisEnd) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    return items;
  };

  const [showFilters, setShowFilters] = useState(true);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SearchBar />

        <Alert className="mt-4 mb-8 bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            We try our best to ensure all information is correct and accurate. We advise doing some of your own research as well on the accommodation before making any actions.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <aside className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              <div className="mb-6">
                <Label className="mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Label className="mb-2 block">
                  Max Price: R{priceRange[0]}
                </Label>
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>

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

              <div className="mb-6">
                <Label className="mb-2 block">Gender Policy</Label>
                <Select value={selectedGender || ""} onValueChange={(val) => setSelectedGender(val || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                    <SelectItem value="Male Only">Male Only</SelectItem>
                    <SelectItem value="Female Only">Female Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : paginatedAccommodations && paginatedAccommodations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedAccommodations.map((accommodation) => (
                    <AccommodationCard
                      key={accommodation.id}
                      id={accommodation.id}
                      propertyName={accommodation.property_name}
                      type={accommodation.type}
                      university={accommodation.university || ""}
                      address={accommodation.address}
                      city={accommodation.city || ""}
                      monthlyCost={accommodation.monthly_cost || 0}
                      rating={accommodation.rating || 0}
                      nsfasAccredited={accommodation.nsfas_accredited || false}
                      genderPolicy={accommodation.gender_policy || ""}
                      website={accommodation.website || null}
                      amenities={accommodation.amenities || []}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No accommodations found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;

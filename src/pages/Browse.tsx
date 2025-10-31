import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Info } from "lucide-react";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const university = searchParams.get("university") || "";
  const maxCost = searchParams.get("maxCost") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "") || 0;
  const amenitiesParam = searchParams.get("amenities") || "";
  const amenities = amenitiesParam ? amenitiesParam.split(",").map(s => s.trim()).filter(Boolean) : [];
  const nsfasParam = searchParams.get("nsfas") === "true";

  const [sortBy, setSortBy] = useState("rating");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  const { data: accommodations, isLoading } = useQuery({
    queryKey: ["accommodations", location, university, maxCost, nsfasParam, sortBy, minRating, amenitiesParam, selectedGender],
    queryFn: async () => {
      let query = supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active");

      if (location) {
        query = query.or(`property_name.ilike.%${location}%,city.ilike.%${location}%,province.ilike.%${location}%,address.ilike.%${location}%`);
      }

      if (university) {
        query = query.eq("university", university);
      }

      if (maxCost) {
        query = query.lte("monthly_cost", parseInt(maxCost));
      }

      if (nsfasParam) {
        query = query.eq("nsfas_accredited", true);
      }

      if (minRating > 0) {
        query = query.gte("rating", minRating);
      }

      if (amenities.length > 0) {
        query = query.contains("amenities", amenities);
      }

      if (selectedGender && selectedGender !== "all") {
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
        
        <div className="mt-8">

          <div>
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

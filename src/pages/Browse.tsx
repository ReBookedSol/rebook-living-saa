import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import React, { useState } from "react";
import { Info } from "lucide-react";
import Ad from "@/components/Ad";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const university = searchParams.get("university") || "";
  const province = searchParams.get("province") || "";
  const maxCost = searchParams.get("maxCost") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "") || 0;
  const amenitiesParam = searchParams.get("amenities") || "";
  const amenities = amenitiesParam ? amenitiesParam.split(",").map(s => s.trim()).filter(Boolean) : [];
  const nsfasParam = searchParams.get("nsfas") === "true";

  // Default sort: newest first so newly added accommodations appear on page 1
  const [sortBy, setSortBy] = useState("newest");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ITEMS_PER_PAGE = isLargeScreen ? 15 : 9;

  // Reset page when filters/search params change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [location, university, province, maxCost, minRating, amenitiesParam, nsfasParam, selectedGender, sortBy]);

  const { data: pageResult, isLoading } = useQuery({
    queryKey: ["accommodations", location, university, maxCost, nsfasParam, sortBy, minRating, amenitiesParam, selectedGender, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = currentPage * ITEMS_PER_PAGE - 1;

      // Start with select and request exact count
      let query: any = supabase
        .from("accommodations")
        .select("*", { count: 'exact' });

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

      if (province) {
        query = query.eq("province", province);
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
        query = query.order("monthly_cost", { ascending: true }).order("created_at", { ascending: false });
      } else if (sortBy === "price-high") {
        query = query.order("monthly_cost", { ascending: false }).order("created_at", { ascending: false });
      } else if (sortBy === "rating") {
        query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
      } else if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        // fallback to newest first
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      return { data, count };
    },
  });

  const accommodations = pageResult?.data || [];
  const totalPages = pageResult && pageResult.count ? Math.ceil((pageResult.count || 0) / ITEMS_PER_PAGE) : 0;
  const paginatedAccommodations = accommodations;

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
              onClick={() => { setCurrentPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
          <Info className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            We try our best to ensure all information is correct and accurate. We advise doing some of your own research as well on the accommodation before making any actions.
          </AlertDescription>
        </Alert>
        
        <div className="mt-8">

          <div data-listings-container>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : paginatedAccommodations && paginatedAccommodations.length > 0 ? (
              <>
                <div className="space-y-6">
                  {(() => {
                    const rows = [];
                    // Laptop: 3 columns, Mobile: 1 column, Tablet: 2 columns
                    const itemsPerRow = isLargeScreen ? 3 : 2;

                    for (let i = 0; i < paginatedAccommodations.length; i += itemsPerRow) {
                      const rowItems = paginatedAccommodations.slice(i, i + itemsPerRow);
                      rows.push(
                        <div key={`row-${i}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {rowItems.map((accommodation) => (
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
                              imageUrls={accommodation.image_urls || []}
                            />
                          ))}
                        </div>
                      );

                      // Add ad after each row
                      rows.push(
                        <div key={`ad-row-${i}`} className="my-4">
                          <Ad />
                        </div>
                      );
                    }
                    return rows;
                  })()}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {renderPaginationItems()}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

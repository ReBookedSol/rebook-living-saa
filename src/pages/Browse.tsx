import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import React, { useCallback, useRef } from "react";
import { Info, Sparkles, ChevronDown, ChevronUp, Lock } from "lucide-react";
import Ad from "@/components/Ad";
import { useSEO } from "@/hooks/useSEO";
import { AIAccommodationAssistant } from "@/components/AIAccommodationAssistant";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAccessControl } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUniversitiesWithTrainAccess } from "@/lib/gautrain";

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessLevel, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  // Persist page in URL so back-navigation preserves it
  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const setCurrentPage = useCallback((page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(page));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const location = searchParams.get("location") || "";
  const university = searchParams.get("university") || "";
  const province = searchParams.get("province") || "";
  const maxCost = searchParams.get("maxCost") || "";
  const minRating = parseFloat(searchParams.get("minRating") || "") || 0;
  const amenitiesParam = searchParams.get("amenities") || "";
  const amenities = amenitiesParam ? amenitiesParam.split(",").map(s => s.trim()).filter(Boolean) : [];
  const nsfasParam = searchParams.get("nsfas") === "true";
  const nearTrainParam = searchParams.get("nearTrain") === "true";

  // SEO
  useSEO({
    title: university ? `${university} Student Accommodation 2025` : "Browse NSFAS Accredited Student Accommodation South Africa",
    description: `Find verified NSFAS-accredited student accommodation in South Africa 2025/2026. ${university ? `Browse student housing near ${university}.` : "Compare prices, amenities, and reviews from R1500/month."} University accredited, safe, affordable housing for students.`,
    keywords: `NSFAS accommodation 2025, student accommodation South Africa, ${university || "university"} student housing, student rooms ${province || "Johannesburg Pretoria Cape Town"}, university accredited accommodation, student housing near campus`,
    canonical: "/browse",
  });

  // Default sort: newest first so newly added accommodations appear on page 1
  const [sortBy, setSortBy] = React.useState("newest");
  const [selectedGender, setSelectedGender] = React.useState<string>("all");
  const [isLargeScreen, setIsLargeScreen] = React.useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ITEMS_PER_PAGE = isLargeScreen ? 15 : 9;

  // Helper to update page and scroll to top
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  // Reset to page 1 when filters change, but skip the initial mount
  const isInitialMount = useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [location, university, province, maxCost, minRating, amenitiesParam, nsfasParam, nearTrainParam, selectedGender, sortBy]);

  const { data: pageResult, isLoading } = useQuery({
    queryKey: ["accommodations", location, university, maxCost, nsfasParam, nearTrainParam, sortBy, minRating, amenitiesParam, selectedGender, currentPage, isLargeScreen],
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

      if (nearTrainParam) {
        // Get all universities with train station access (Gautrain or MyCiTi)
        const trainAccessUniversities = getUniversitiesWithTrainAccess();
        query = query.in("university", trainAccessUniversities);
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
    const canAccessPage = isPaidUser || currentPage <= 5;

    for (let i = 1; i <= totalPages; i++) {
      const pageAccessible = isPaidUser || i <= 5;
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => pageAccessible && handlePageChange(i)}
              isActive={currentPage === i}
              className={!pageAccessible ? "opacity-50 cursor-not-allowed" : ""}
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

  const [showFilters, setShowFilters] = React.useState(true);
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SearchBar />

        {/* AI Assistant Toggle - Only show for free users as upgrade prompt */}
        {!isPaidUser && (
          <Collapsible open={showAIAssistant} onOpenChange={setShowAIAssistant} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between border-primary/20 hover:border-primary/40">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Accommodation Assistant
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </span>
                {showAIAssistant ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Unlock AI-Powered Search
                  </CardTitle>
                  <CardDescription>
                    Get intelligent recommendations, compare listings, and chat with our AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpgradePrompt 
                    type="general"
                    buttonText="Upgrade to Pro for AI Features"
                  />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Alert className="mt-4 mb-8 bg-muted/50 border-muted">
          <Info className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-center">
            We aim for accuracy, but please do your own research before making any decisions.
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
                    // Laptop: 3 columns, Mobile: 2 columns, Tablet: 2 columns
                    const itemsPerRow = isLargeScreen ? 3 : 2;
                    const itemsPerAdBlock = 3;

                    let adCounter = 0;
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
                              isLandlordListing={accommodation.is_landlord_listing || false}
                            />
                          ))}
                        </div>
                      );

                      adCounter += rowItems.length;
                      // Add ad after every 3 listings (only for free users)
                      if (!isPaidUser && adCounter >= itemsPerAdBlock && i + itemsPerRow < paginatedAccommodations.length) {
                        rows.push(
                          <div key={`ad-row-${i}`} className="my-4">
                            <Ad />
                          </div>
                        );
                        adCounter = 0;
                      }
                    }
                    return rows;
                  })()}
                </div>

                {totalPages > 1 && (
                   <div className="mt-8">
                     {/* CTA for pages beyond 5 for non-logged-in users */}
                     {!isPaidUser && currentPage > 5 && (
                       <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-background mb-8">
                         <CardHeader className="text-center">
                           <CardTitle className="text-2xl flex items-center justify-center gap-2">
                             <Lock className="w-6 h-6 text-primary" />
                             Explore All 4,300+ Accommodations
                           </CardTitle>
                           <CardDescription className="text-base mt-2">
                             Create your free account to browse unlimited listings
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-4">
                           <div className="grid grid-cols-3 gap-4">
                             <div className="text-center">
                               <div className="text-3xl font-bold text-primary">50,000+</div>
                               <p className="text-xs text-muted-foreground">Property Photos</p>
                             </div>
                             <div className="text-center">
                               <div className="text-3xl font-bold text-primary">10,000+</div>
                               <p className="text-xs text-muted-foreground">Student Reviews</p>
                             </div>
                             <div className="text-center">
                               <div className="text-3xl font-bold text-primary">100%</div>
                               <p className="text-xs text-muted-foreground">Completely Free</p>
                             </div>
                           </div>
                           <Button 
                             onClick={() => navigate('/auth')}
                             className="w-full h-11 text-base"
                           >
                             Create Free Account
                           </Button>
                           <p className="text-xs text-center text-muted-foreground">
                             No payment required. Join thousands of students.
                           </p>
                         </CardContent>
                       </Card>
                     )}
                     <Pagination>
                       <PaginationContent>
                         <PaginationItem>
                           <PaginationPrevious
                             onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                             className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                           />
                         </PaginationItem>
                         {renderPaginationItems()}
                         <PaginationItem>
                           <PaginationNext
                             onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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

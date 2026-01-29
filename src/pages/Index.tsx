import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: featuredListings, isLoading } = useQuery({
    queryKey: ["featured-accommodations", Math.floor(Date.now() / (60 * 60 * 1000))],
    queryFn: async () => {
      // Determine total active accommodations
      const { data: countData, count, error: countError } = await supabase
        .from("accommodations")
        .select("id", { count: "exact" });

      if (countError) throw countError;
      const total = count || 0;
      if (total === 0) return [];

      const hourIndex = Math.floor(Date.now() / (60 * 60 * 1000));
      const start = hourIndex % total;
      const countNeeded = 6;
      const end = Math.min(start + countNeeded - 1, total - 1);

      const { data: firstBatch, error: firstError } = await supabase
        .from("accommodations")
        .select("*")
        .order("rating", { ascending: false })
        .range(start, end);

      if (firstError) throw firstError;

      if ((firstBatch?.length || 0) < countNeeded) {
        const remaining = countNeeded - (firstBatch?.length || 0);
        const { data: secondBatch, error: secondError } = await supabase
          .from("accommodations")
          .select("*")
          .order("rating", { ascending: false })
          .range(0, remaining - 1);
        if (secondError) throw secondError;
        return [...(firstBatch || []), ...(secondBatch || [])];
      }

      return firstBatch;
    },
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });

  return (
    <Layout>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Feature tiles - modern, minimal design */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-transparent via-white/30 to-transparent">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">Why Choose ReBooked Living for Student Accommodation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group rounded-xl p-6 bg-white/50 backdrop-blur border border-white/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary/80 group-hover:text-primary transition-colors">01</div>
              <div className="text-lg font-semibold mt-3 text-foreground">Browse Listings</div>
              <p className="text-sm mt-2 text-muted-foreground">Curated student accommodation options</p>
            </div>
            <div className="group rounded-xl p-6 bg-white/50 backdrop-blur border border-white/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary/80 group-hover:text-primary transition-colors">02</div>
              <div className="text-lg font-semibold mt-3 text-foreground">NSFAS Accredited</div>
              <p className="text-sm mt-2 text-muted-foreground">Verified options across SA</p>
            </div>
            <div className="group rounded-xl p-6 bg-white/50 backdrop-blur border border-white/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary/80 group-hover:text-primary transition-colors">03</div>
              <div className="text-lg font-semibold mt-3 text-foreground">Smart Filters</div>
              <p className="text-sm mt-2 text-muted-foreground">Find what matters to you</p>
            </div>
            <div className="group rounded-xl p-6 bg-white/50 backdrop-blur border border-white/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <div className="text-4xl font-bold text-primary/80 group-hover:text-primary transition-colors">04</div>
              <div className="text-lg font-semibold mt-3 text-foreground">Easy Connection</div>
              <p className="text-sm mt-2 text-muted-foreground">Connect directly with landlords</p>
            </div>
          </div>
        </div>
      </section>


      {/* Accredited Universities carousel (continuous auto-scrolling marquee) */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white/30 to-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Accredited Across South Africa</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">We partner with verified accommodations for top universities nationwide</p>
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-wrapper { overflow: hidden; }
            .marquee-track { display: flex; gap: 1rem; align-items: center; width: max-content; animation: marquee 30s linear infinite; }
            .marquee-item { flex: 0 0 auto; width: 160px; }
          `}</style>

          <div className="marquee-wrapper">
            <div className="marquee-track">
              {(() => {
                const items = [
                  { name: 'Cape Peninsula University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fdd3f79bff5204a1598dafadcf67dc845?format=webp&width=800' },
                  { name: 'University of Zululand', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fa1462063edff4136aa6b3f8f2f28fb60?format=webp&width=800' },
                  { name: 'Walter Sisulu University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F7336ffee8a5d444fb73e0305fb1de017?format=webp&width=800' },
                  { name: 'University of Venda', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fddbea07a58154b82adce08a5ec4ee7d6?format=webp&width=800' },
                  { name: 'University of South Africa (UNISA)', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fcf83ac7e02484e3b9d997a344ba71b38?format=webp&width=800' },
                  { name: 'Nelson Mandela University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fdaaa8a2acf8048d1bfa0719fb10bac30?format=webp&width=800' },
                  { name: 'University of Johannesburg', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F83842c23ccc3423e863dd8a8f3870db0?format=webp&width=800' },
                  { name: 'University of the Witwatersrand', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fa7c47d3fcaed4d519b24179ecb387ab5?format=webp&width=800' },
                  { name: 'Stellenbosch University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F2587c0fe8bba4fc49f5a7e3a595d658f?format=webp&width=800' },
                  { name: 'Sefako Makgatho Health Sciences University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F8192f040973b47aa83916dc1d4ac4576?format=webp&width=800' },

                  { name: 'Rhodes University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F7a6a9c9034814f95a50b9f6809364413?format=webp&width=800' },
                  { name: 'University of Pretoria', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fd6ef31c9ee0e4ee5af4eb8c0f15c6e78?format=webp&width=800' },
                  { name: 'North-West University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F848378a075a84246b0514b8b57cc72e2?format=webp&width=800' },
                  { name: 'University of Limpopo', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F4e0a3bf953c74672b7497e0639e3144e?format=webp&width=800' },
                  { name: 'University of KwaZulu-Natal', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F279fcfd0958f49f08a8d882c939b2d3e?format=webp&width=800' },
                  { name: 'University of the Free State', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F978596f651974bd5a03106c8c489d706?format=webp&width=800' },
                  { name: 'University of Fort Hare', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F4c011c2a32bf47cba51ea98ce746d059?format=webp&width=800' },
                  { name: 'University of Cape Town', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fd5948bbfce7f40658e8e73601575e3d6?format=webp&width=800' },
                  { name: 'Vaal University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F1fd45a76dc5c48afa9da7a6c114d7c9c?format=webp&width=800' },
                  { name: 'Tshwane University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F0ca5e48711b446e4a6ab7265b1fe70c0?format=webp&width=800' },

                  { name: 'Sol Plaatje University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fb6c76e80b95a4395b104a26b3df10226?format=webp&width=800' },
                  { name: 'University of Mpumalanga', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fbd74672545364f308902d10f33374a06?format=webp&width=800' },
                  { name: 'Mangosuthu University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F138df0329f6d4c2cafc27caa699da2ab?format=webp&width=800' },
                  { name: 'Durban University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fdd56c08897c54cf58fc7f304e268c801?format=webp&width=800' },
                  { name: 'Central University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fad248754621646e68feca7f8c01de238?format=webp&width=800' },
                ];

                // duplicate the list for seamless scroll
                const track = items.concat(items);

                return track.map((u, idx) => (
                  <div key={`${u.name}-${idx}`} className="marquee-item flex flex-col items-center justify-center p-5 bg-white/60 backdrop-blur rounded-xl border border-white/30 hover:border-primary/20 transition-all">
                    <img src={u.logo} alt={u.name} className="w-full h-16 object-contain" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
                    <div className="text-xs text-center text-muted-foreground mt-3 line-clamp-2">{u.name}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>


      {/* Search section extracted from hero to match layout */}
      <section id="search" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Find Your Home Now</h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Use smart filters to search by location, price, amenities, and NSFAS accreditation status
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur border border-white/30 rounded-2xl p-6 md:p-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Section header similar to "Workflow Templates" */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start mb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Top Rated Rooms</h2>
            </div>
            <p className="text-base text-muted-foreground max-w-prose leading-relaxed">
              Discover verified, NSFAS-accredited student accommodation near major universities across South Africa. Affordable and safe.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog-style grid for featured listings */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <span className="text-base text-muted-foreground font-medium">Curated selections across South Africa</span>
            <Link to="/browse">
              <Button variant="outline" className="items-center gap-2 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings?.map((listing) => (
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
                  nsfasAccredited={listing.nsfas_accredited || false}
                  genderPolicy={listing.gender_policy || ""}
                  website={listing.website || null}
                  amenities={listing.amenities || []}
                  imageUrls={listing.image_urls || []}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-6 md:hidden">
            <Link to="/browse">
              <Button variant="outline" className="items-center gap-2 rounded-full">
                View all listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA with pricing offer */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/40 px-6 md:px-12 py-12 md:py-16">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                  Why waste <span className="text-primary">R1,500</span> when <span className="text-accent">R19</span> unlocks everything?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get verified information, direct landlord access, and insider tips to find your perfect student home. Better safe than sorry.
                </p>
                <Link to="/browse">
                  <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold">
                    Start Searching Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

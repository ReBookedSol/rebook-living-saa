import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
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
      {/* Hero - background house image */}
      <section className="relative h-[65vh] md:h-[72vh]">
        <img
          src="https://picsum.photos/id/1018/1600/900"
          alt="Student accommodation interior"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-primary/30 to-transparent" />

        <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
                  All‑in‑one Student Housing Hub
                </h1>
              </div>
              <div className="flex flex-col items-start gap-6">
                <p className="text-base md:text-lg text-white/90 max-w-md">
                  Smart search, curated listings, and NSFAS‑ready filters. Designed to help you find the perfect student home fast.
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/browse">
                    <Button size="lg" className="rounded-full px-8 bg-white text-primary">
                      Explore Listings
                    </Button>
                  </Link>
                  <a href="#search" className="text-sm font-medium text-white/90 hover:underline">
                    Advanced search
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature tiles - four up row using brand colors */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl p-6 bg-secondary text-secondary-foreground">
              <div className="text-2xl font-semibold">Browse</div>
              <p className="text-sm mt-2 text-muted-foreground">Curated student listings</p>
            </div>
            <div className="rounded-2xl p-6 bg-primary text-primary-foreground">
              <div className="text-2xl font-semibold">NSFAS</div>
              <p className="text-sm mt-2 opacity-90">Accredited options</p>
            </div>
            <div className="rounded-2xl p-6 bg-accent text-accent-foreground">
              <div className="text-2xl font-semibold">Guides</div>
              <p className="text-sm mt-2 opacity-90">Housing & budgeting</p>
            </div>
            <div className="rounded-2xl p-6 bg-muted">
              <div className="text-2xl font-semibold">Partners</div>
              <p className="text-sm mt-2 text-muted-foreground">Work with Rebooked Living</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search section extracted from hero to match layout */}
      <section id="search" className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Accredited Universities carousel (continuous auto-scrolling marquee) */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Accredited Universities From</h2>
          <p className="text-sm text-muted-foreground mb-4">Explore accommodations accredited for these universities.</p>

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
              {[
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
              ].concat([
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
              ]).map((u, idx) => {
                const label = encodeURIComponent(u.replace(/\s+/g, '+'));
                const logo = `https://via.placeholder.com/160x80?text=${label}`;
                return (
                  <div key={`${u}-${idx}`} className="marquee-item flex flex-col items-center p-4 bg-card rounded-lg">
                    <img src={logo} alt={u} className="w-full h-20 object-contain mb-2" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
                    <div className="text-sm text-center">{u}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section header similar to "Workflow Templates" */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Latest Listings</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-prose">
              Freshly added student accommodation from across South Africa. Filter by city, budget, and NSFAS to find a great fit.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog-style grid for featured listings */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">Showing top rated</span>
            <Link to="/browse">
              <Button variant="outline" className="items-center gap-2 rounded-full">
                View all
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

          <div className="text-center mt-8 md:hidden">
            <Link to="/browse">
              <Button variant="outline" className="items-center gap-2 rounded-full">
                View all listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band using accent gradient */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))', padding: '3rem', borderRadius: '0.75rem' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Want to collaborate or advertise with us?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We're open to partnerships and thoughtful collaborations. Get in touch and let's discuss how we can work together.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8 rounded-full">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

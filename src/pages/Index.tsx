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
    queryKey: ["featured-accommodations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      {/* Hero - background house image */}
      <section className="relative h-[65vh] md:h-[72vh]">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="House exterior"
          className="absolute inset-0 w-full h-full object-cover"
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
              <p className="text-sm mt-2 text-muted-foreground">Work with Rebooked</p>
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
                  imageUrl={listing.image_urls?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"}
                  nsfasAccredited={listing.nsfas_accredited || false}
                  genderPolicy={listing.gender_policy || ""}
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
        <div className="container mx-auto px-4 text-center" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--muted)))', padding: '3rem', borderRadius: '0.75rem' }}>
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Shield, Search } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[75vh]">
        <img
          src="https://images.pexels.com/photos/32982365/pexels-photo-32982365.jpeg"
          alt="South African student accommodation exterior on a university campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-4 relative z-10 flex h-full flex-col items-center justify-center text-center">
          <div className="max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Perfect Student Home in South Africa
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Discover quality, affordable, and NSFAS-accredited accommodation near your university
            </p>
          </div>

          <div className="w-full max-w-5xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
              <p className="text-muted-foreground">
                Browse hundreds of verified student accommodations across South Africa
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">NSFAS Accredited</h3>
              <p className="text-muted-foreground">
                Easy filtering for NSFAS-accredited properties with verified listings
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-muted-foreground">
                Find accommodation near your university within your budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Accommodation</h2>
              <p className="text-muted-foreground">Top-rated properties available now</p>
            </div>
            <Link to="/browse">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Button variant="outline" className="items-center gap-2">
                View All Listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent via-accent-hover to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Want to collaborate or advertise with us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We're open to partnerships and thoughtful collaborations. Get in touch and let's discuss how we can work together.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

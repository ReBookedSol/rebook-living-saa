import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AccommodationCard from "@/components/AccommodationCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Shield, GraduationCap, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: featuredListings, isLoading } = useQuery({
    queryKey: ["featured-accommodations", Math.floor(Date.now() / (60 * 60 * 1000))],
    queryFn: async () => {
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
    refetchInterval: 60 * 60 * 1000,
  });

  const universityLogos = [
    { name: 'Cape Peninsula University of Technology', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fdd3f79bff5204a1598dafadcf67dc845?format=webp&width=800' },
    { name: 'University of Zululand', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fa1462063edff4136aa6b3f8f2f28fb60?format=webp&width=800' },
    { name: 'Walter Sisulu University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F7336ffee8a5d444fb73e0305fb1de017?format=webp&width=800' },
    { name: 'University of Venda', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fddbea07a58154b82adce08a5ec4ee7d6?format=webp&width=800' },
    { name: 'University of South Africa', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fcf83ac7e02484e3b9d997a344ba71b38?format=webp&width=800' },
    { name: 'Nelson Mandela University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fdaaa8a2acf8048d1bfa0719fb10bac30?format=webp&width=800' },
    { name: 'University of Johannesburg', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F83842c23ccc3423e863dd8a8f3870db0?format=webp&width=800' },
    { name: 'Wits University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fa7c47d3fcaed4d519b24179ecb387ab5?format=webp&width=800' },
    { name: 'Stellenbosch University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F2587c0fe8bba4fc49f5a7e3a595d658f?format=webp&width=800' },
    { name: 'University of Pretoria', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fd6ef31c9ee0e4ee5af4eb8c0f15c6e78?format=webp&width=800' },
    { name: 'North-West University', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2F848378a075a84246b0514b8b57cc72e2?format=webp&width=800' },
    { name: 'University of Cape Town', logo: 'https://cdn.builder.io/api/v1/image/assets%2F3fe99bb47eea469287a61aee79801588%2Fd5948bbfce7f40658e8e73601575e3d6?format=webp&width=800' },
  ];

  return (
    <Layout>
      {/* Hero Section - Modern, Clean Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4907201/pexels-photo-4907201.jpeg"
            alt="Modern student accommodation"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Student Accommodation Made Simple
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Hey There! Where are you{" "}
              <span className="text-gradient">Studying</span>?
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
              Find verified, NSFAS-accredited student rooms near South African universities. Compare prices and amenities with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/browse">
                <Button size="lg" className="rounded-full px-8 gap-2 btn-modern">
                  Explore Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#search">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Search Accommodation
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Search Card */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 hidden lg:block">
          <div className="container mx-auto px-4">
            <div className="search-card-float p-6 max-w-5xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Search - Visible on smaller screens */}
      <section id="search" className="py-12 lg:pt-32 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="search-card-float p-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 lg:pt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <div className="card-modern p-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse</h3>
              <p className="text-sm text-muted-foreground">Curated student listings near major universities</p>
            </div>

            <div className="card-modern p-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">NSFAS</h3>
              <p className="text-sm text-muted-foreground">Verified NSFAS-accredited accommodation options</p>
            </div>

            <div className="card-modern p-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Guides</h3>
              <p className="text-sm text-muted-foreground">Expert housing and budgeting resources</p>
            </div>

            <div className="card-modern p-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Partners</h3>
              <p className="text-sm text-muted-foreground">Work with trusted property partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* University Logos Marquee */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 mb-8">
          <div className="text-center">
            <h2 className="section-heading text-2xl md:text-3xl mb-2">Accredited Accommodations</h2>
            <p className="section-subheading mx-auto">Partnered with leading South African universities</p>
          </div>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...universityLogos, ...universityLogos].map((uni, idx) => (
              <div key={`${uni.name}-${idx}`} className="marquee-item">
                <img 
                  src={uni.logo} 
                  alt={uni.name} 
                  className="w-full h-16 object-contain" 
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="section-heading mb-4">Featured Student Rooms</h2>
              <p className="section-subheading">
                Top-rated, NSFAS-approved accommodation near major universities. Safe, affordable options from R1,500/month.
              </p>
            </div>
            <Link to="/browse" className="shrink-0">
              <Button variant="outline" className="rounded-full gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
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

          {/* Mobile CTA */}
          <div className="text-center mt-10 md:hidden">
            <Link to="/browse">
              <Button variant="outline" className="rounded-full gap-2">
                View all listings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="card-modern overflow-hidden">
            <div className="relative p-8 md:p-12 lg:p-16 bg-gradient-to-r from-primary to-primary/80">
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Want to collaborate or advertise?
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-8">
                  We're open to partnerships and thoughtful collaborations. Get in touch and let's discuss how we can work together.
                </p>
                <Link to="/contact">
                  <Button size="lg" variant="secondary" className="rounded-full px-8">
                    Contact Us
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
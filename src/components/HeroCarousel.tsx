import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CarouselSlide {
  image: string;
  alt: string;
  headline: string;
  description: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    image: "https://images.pexels.com/photos/4907201/pexels-photo-4907201.jpeg",
    alt: "Modern student accommodation with spacious living areas and study rooms",
    headline: "Your Perfect Student Home Awaits",
    description:
      "Discover verified, NSFAS-accredited accommodation near South African universities. Safe, affordable, and perfect for student life.",
  },
  {
    image: "https://images.pexels.com/photos/14601013/pexels-photo-14601013.jpeg",
    alt: "Contemporary student housing with unique architecture",
    headline: "Contemporary Living Spaces Designed for You",
    description:
      "Explore modern accommodation featuring innovative architecture, fully equipped amenities, and community-focused environments built for student success.",
  },
  {
    image: "https://images.pexels.com/photos/6782578/pexels-photo-6782578.jpeg",
    alt: "Modern bedroom with comfortable furnishings and natural lighting",
    headline: "Comfort Meets Affordability",
    description:
      "Find your ideal bedroom in premium student residences with high-quality furnishings, natural lighting, and peaceful study environments.",
  },
  {
    image: "https://images.pexels.com/photos/35707768/pexels-photo-35707768.jpeg",
    alt: "Residential building with excellent facilities and location",
    headline: "Prime Locations Near Your Campus",
    description:
      "Access accommodation in strategic locations close to major South African universities, with excellent transport links and local amenities.",
  },
  {
    image: "https://images.pexels.com/photos/7212942/pexels-photo-7212942.jpeg",
    alt: "Shared living spaces with modern common areas for socializing",
    headline: "Community Living at Its Best",
    description:
      "Connect with fellow students in vibrant shared spaces designed for collaboration, friendship, and unforgettable university experiences.",
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = carouselSlides[currentSlide];

  return (
    <section className="relative h-[65vh] md:h-[72vh]">
      {/* Background image with overlay */}
      <img
        src={currentSlideData.image}
        alt={currentSlideData.alt}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
        }}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20" />

      {/* Carousel content */}
      <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
        <div className="w-full max-w-3xl" style={{ animation: "fadeIn 0.8s ease-in-out" }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white mb-6">
            {currentSlideData.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mb-8 leading-relaxed">
            {currentSlideData.description}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/browse">
              <Button
                size="lg"
                className="rounded-full px-8 bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Explore Listings
              </Button>
            </Link>
            <a
              href="#search"
              className="text-base font-medium text-white hover:text-white/80 transition-colors"
            >
              Advanced search →
            </a>
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Train, 
  Bus, 
  Car, 
  MapPin, 
  DollarSign, 
  Clock,
  Users,
  Zap,
  Leaf
} from "lucide-react";
import GautrainInfo from "@/components/GautrainInfo";

// Transportation cards data
const TRANSPORT_METHODS = [
  {
    name: "Gautrain",
    icon: Train,
    color: "from-blue-500 to-blue-600",
    image: "https://images.pexels.com/photos/8348559/pexels-photo-8348559.jpeg",
    fare: "R76-124",
    time: "15-25 mins",
    frequency: "Every 15 mins",
    availability: "5:30 AM - 11 PM",
    pros: ["Fast & Reliable", "Most comfortable", "Set schedules"],
    cons: ["Limited routes", "Higher cost"],
  },
  {
    name: "Uber & Bolt",
    icon: Car,
    color: "from-pink-500 to-pink-600",
    image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
    fare: "R50-150",
    time: "15-30 mins",
    frequency: "On demand",
    availability: "24/7",
    pros: ["Door-to-door", "24/7 service", "Convenient"],
    cons: ["Surge pricing", "Most expensive"],
  },
  {
    name: "Minibus Taxis",
    icon: Bus,
    color: "from-orange-500 to-orange-600",
    image: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg",
    fare: "R15-30",
    time: "20-40 mins",
    frequency: "Throughout day",
    availability: "6 AM - 10 PM",
    pros: ["Most affordable", "Frequent", "Routes everywhere"],
    cons: ["Less comfort", "No set schedule"],
  },
  {
    name: "Public Buses",
    icon: Bus,
    color: "from-cyan-500 to-cyan-600",
    image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
    fare: "R20-40",
    time: "30-50 mins",
    frequency: "Hourly",
    availability: "5 AM - 10 PM",
    pros: ["Affordable", "Reliable routes", "Safe"],
    cons: ["Slower", "Limited frequency"],
  },
  {
    name: "Walking",
    icon: Leaf,
    color: "from-green-500 to-green-600",
    image: "https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg",
    fare: "Free",
    time: "Varies",
    frequency: "Always available",
    availability: "Daytime (safe)",
    pros: ["Free", "Healthy", "Eco-friendly"],
    cons: ["Limited distance", "Weather dependent"],
  },
  {
    name: "Cycling",
    icon: Zap,
    color: "from-yellow-500 to-yellow-600",
    image: "https://images.pexels.com/photos/280897/pexels-photo-280897.jpeg",
    fare: "Free",
    time: "Varies",
    frequency: "Always available",
    availability: "Daytime (safe)",
    pros: ["Free", "Healthy", "Eco-friendly"],
    cons: ["Limited distance", "Weather dependent"],
  },
];

const UNIVERSITY_ROUTES = [
  {
    university: "University of Pretoria",
    station: "Hatfield",
    distance: "5-8 km",
    description: "Easy access via Gautrain to Hatfield station",
  },
  {
    university: "Wits University",
    station: "Park Station/Rosebank",
    distance: "3-10 km",
    description: "Central location with multiple transport options",
  },
  {
    university: "University of Johannesburg",
    station: "Rosebank/Sandton",
    distance: "5-12 km",
    description: "Well-connected via Gautrain and bus routes",
  },
  {
    university: "UNISA",
    station: "Pretoria/Hatfield",
    distance: "Varies",
    description: "Multiple campuses across Pretoria",
  },
  {
    university: "TUT (Tshwane University of Technology)",
    station: "Pretoria/Centurion",
    distance: "8-15 km",
    description: "Gautrain access to Pretoria and Centurion",
  },
];

const HeroCarouselTravel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
      headline: "Explore Your Travel Options",
      description: "Find the best transportation methods to fit your lifestyle and budget",
    },
    {
      image: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
      headline: "Get Around with Ease",
      description: "Multiple transportation options available 24/7 across South Africa",
    },
    {
      image: "https://images.pexels.com/photos/2869212/pexels-photo-2869212.jpeg",
      headline: "Smart Commuting Starts Here",
      description: "Compare costs, times, and comfort levels for your daily travel",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[50vh] md:h-[60vh]">
      <img
        key={currentSlide}
        src={slide.image}
        alt={slide.headline}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
        }}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/20" />

      <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {slide.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8">
            {slide.description}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default function Travel() {
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Carousel */}
        <HeroCarouselTravel />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Transportation Methods Section */}
          <div className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Transportation Methods</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Discover all your commuting options. Click on any card to see detailed information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRANSPORT_METHODS.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedTransport === method.name;

                return (
                  <Card
                    key={method.name}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedTransport(isSelected ? null : method.name)
                    }
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden bg-muted">
                      <img
                        src={method.image}
                        alt={method.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-30`}
                      />
                    </div>

                    {/* Content */}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{method.name}</h3>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-primary">
                            {method.fare}
                          </div>
                          <div className="text-xs text-muted-foreground">Fare</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-primary">
                            {method.time}
                          </div>
                          <div className="text-xs text-muted-foreground">Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-primary">
                            {method.frequency}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Frequency
                          </div>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      <Badge variant="outline" className="mb-4 text-xs">
                        {method.availability}
                      </Badge>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="space-y-4 pt-4 border-t animate-in fade-in">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Advantages
                            </h4>
                            <div className="space-y-1">
                              {method.pros.map((pro, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm text-green-700 flex items-center gap-2"
                                >
                                  <span className="text-green-500">✓</span>
                                  {pro}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Considerations
                            </h4>
                            <div className="space-y-1">
                              {method.cons.map((con, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm text-orange-700 flex items-center gap-2"
                                >
                                  <span className="text-orange-500">!</span>
                                  {con}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Gautrain Detailed Section */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Gautrain Network
            </h2>
            <GautrainInfo showFareCalculator={true} />
          </div>

          {/* Universities & Routes Section */}
          <div className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                University Routes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Quick guide to accessing major South African universities from accommodation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {UNIVERSITY_ROUTES.map((route) => (
                <Card key={route.university} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          {route.university}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          Station: {route.station}
                        </div>
                      </div>
                      <Badge variant="secondary">{route.distance}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {route.description}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      View Routes →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 md:p-12 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Money-Saving Tips
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Gautrain Monthly Pass</h4>
                    <p className="text-sm text-muted-foreground">
                      Save up to 15% with monthly passes. Valid for 44 days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <DollarSign className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Minibus Taxi Combos</h4>
                    <p className="text-sm text-muted-foreground">
                      Most affordable option at R15-30. Keep small change ready.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Student Discounts</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask about student rates at Gautrain stations (up to 20% off).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Clock className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Off-Peak Travel</h4>
                    <p className="text-sm text-muted-foreground">
                      Avoid 7-9 AM and 4-6 PM for cheaper Uber/Bolt fares.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Leaf className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Mixed Methods</h4>
                    <p className="text-sm text-muted-foreground">
                      Walk 1km + use Gautrain for efficient, affordable commutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Bus className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Joburg Connect Card</h4>
                    <p className="text-sm text-muted-foreground">
                      Public bus monthly pass with discounts on Metrobus routes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

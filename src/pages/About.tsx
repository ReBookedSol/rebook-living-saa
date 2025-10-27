import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Rebook Living</h1>
            <p className="text-xl text-muted-foreground">
              Connecting South African students with quality, affordable accommodation
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              Rebook Living was founded with a simple yet powerful mission: to make finding student accommodation
              in South Africa easier, safer, and more affordable. We understand the challenges students face when
              searching for a place to call home while pursuing their education.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">Why Choose Rebook Living?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
              <div className="p-6 bg-card border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">NSFAS Accredited</h3>
                <p className="text-muted-foreground">
                  Easily filter and find NSFAS-accredited properties, making financial aid accessible and straightforward.
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                <p className="text-muted-foreground">
                  All properties on our platform are verified to ensure you get accurate information and reliable options.
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Student-Focused</h3>
                <p className="text-muted-foreground">
                  Our platform is designed specifically for students, with search filters that match your university and budget.
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Supporting Communities</h3>
                <p className="text-muted-foreground">
                  We connect students with local communities and help landlords reach the right audience for their properties.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Founded by a team of former students who experienced the struggles of finding suitable accommodation firsthand,
              Rebook Living was born out of necessity. We saw the need for a centralized, reliable platform that could bridge
              the gap between students seeking accommodation and landlords offering quality housing.
            </p>
            <p className="text-muted-foreground mb-4">
              Today, we serve thousands of students across South Africa's major universities, from Cape Town to Johannesburg,
              Durban to Pretoria, and everywhere in between. Our platform continues to grow, adding new properties daily and
              helping more students find their perfect home away from home.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">
              Whether you're a student looking for accommodation or a landlord wanting to list your property, Rebook Living
              is here to help. Together, we're building a better future for student housing in South Africa.
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary to-primary-hover p-8 rounded-xl text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Find Your Home?</h2>
            <p className="mb-6 text-white/90">Start browsing thousands of verified student accommodations today</p>
            <Link to="/browse">
              <Button size="lg" variant="secondary">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;

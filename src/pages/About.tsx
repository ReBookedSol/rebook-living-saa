import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Rebook Living</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We help South African students find safe, affordable, and convenient accommodation near their universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-card border rounded-lg text-center">
              <h3 className="font-semibold mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">Make student housing simple, transparent, and accessible.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg text-center">
              <h3 className="font-semibold mb-2">Our Values</h3>
              <p className="text-sm text-muted-foreground">Trust, affordability, and student-first design.</p>
            </div>
            <div className="p-6 bg-card border rounded-lg text-center">
              <h3 className="font-semibold mb-2">What We Do</h3>
              <p className="text-sm text-muted-foreground">Verify listings, surface NSFAS-accredited options, and simplify search by university.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">A concise story</h2>
            <p className="text-muted-foreground mb-4">Born from the frustrations of students, our team built a straightforward platform focused on practical features that matter to students: verified listings, easy filters for NSFAS, and clear pricing information.</p>

            <h2 className="text-2xl font-bold mb-4">Join Us</h2>
            <p className="text-muted-foreground mb-4">If you'd like to collaborate, list feedback, or help improve the platform, reach out — we value thoughtful contributions.</p>
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

import Layout from "@/components/Layout";
import { Home, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">About ReBooked Living</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-6">We help South African students find safe, affordable, and convenient accommodation near their universities. Our platform focuses on verified listings, clear pricing, and tools that make searching and comparing options simple.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Verified Listings</div>
                    <div className="text-sm text-muted-foreground">We surface NSFAS/accredited and university-approved accommodation where available.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                  <div className="p-2 rounded bg-accent/10 text-accent">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Student First</div>
                    <div className="text-sm text-muted-foreground">Our features and filters are built with student needs in mind.</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/browse">
                  <Button className="bg-primary text-white">Browse Listings</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </div>

            <div className="order-first md:order-last">
              <div className="w-full h-64 rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-md flex items-center justify-center text-white">
                <div className="text-center px-6">
                  <Home className="w-10 h-10 mb-3 mx-auto" />
                  <div className="text-xl font-semibold">Find your home near campus</div>
                  <div className="text-sm text-white/90 mt-2">Search by university, funding type, and price to find the right match.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-card border rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Our Mission</h3>
              </div>
              <p className="text-sm text-muted-foreground">Make student housing simple, transparent, and accessible for every student in South Africa.</p>
            </div>

            <div className="p-6 bg-card border rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Our Values</h3>
              </div>
              <p className="text-sm text-muted-foreground">Trust, affordability, and a student-first approach guide our product decisions and partnerships.</p>
            </div>

            <div className="p-6 bg-card border rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-accent" />
                <h3 className="font-semibold">What We Do</h3>
              </div>
              <p className="text-sm text-muted-foreground">Verify listings, surface NSFAS-accredited options, and simplify search by university and price.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12 text-muted-foreground">
            <h2 className="text-2xl font-bold mb-4">A concise story</h2>
            <p>Born from the frustrations of students, our team built a straightforward platform focused on practical features that matter: verified listings, easy NSFAS filters, clear pricing, and reliable contact info.</p>

            <h2 className="text-2xl font-bold mb-4">Join Us</h2>
            <p>We welcome feedback, partnerships, and contributions. If you’d like to collaborate or share feedback, please <Link to="/contact" className="text-primary underline">contact our team</Link>.</p>
          </div>

          <div className="bg-gradient-to-r from-accent to-primary p-8 rounded-xl text-white shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Ready to find your home?</h2>
                <p className="text-sm text-white/90">Browse thousands of verified student accommodations and compare options near your university.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/browse"><Button className="bg-white text-primary">Browse Listings</Button></Link>
                <Link to="/auth"><Button variant="outline" className="text-white border-white">Sign in / Sign up</Button></Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default About;

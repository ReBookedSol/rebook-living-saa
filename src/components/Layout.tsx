import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Info, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Smooth scroll to top on navigation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Home className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Rebook Living</span>
            </Link>

            {!isAdmin && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/browse" className="text-sm font-medium hover:text-primary transition-colors">
                  Browse
                </Link>
                <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            )}

            {!isAdmin && (
              <div className="md:hidden flex items-center gap-2">
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <Home className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center mt-2 text-xs text-muted-foreground">Powered by Rebooked Solutions</div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Rebook Living
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting South African students with quality accommodation.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">Powered by Rebooked Solutions</div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse" className="text-muted-foreground hover:text-primary">Browse Listings</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal & Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li className="text-muted-foreground">Email: <a href="mailto:info@rebookedsolutions.co.za" className="hover:text-primary">info@rebookedsolutions.co.za</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rebooked Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

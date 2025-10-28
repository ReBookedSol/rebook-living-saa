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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                <Home className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Rebook Living</span>
            </Link>

            {!isAdmin && (
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-base font-medium hover:underline underline-offset-4">
                  Home
                </Link>
                <Link to="/browse" className="text-base font-medium hover:underline underline-offset-4">
                  Browse
                </Link>
                <Link to="/about" className="text-base font-medium hover:underline underline-offset-4">
                  About
                </Link>
                <Link to="/contact" className="text-base font-medium hover:underline underline-offset-4">
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
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Home className="w-6 h-6" />
                Rebook Living
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting South African students with quality accommodation.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">Powered by Rebooked Solutions</div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse" className="text-muted-foreground hover:text-primary">Browse Listings</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Stay in the loop</h4>
              <p className="text-sm text-muted-foreground mb-3">Subscribe for new listings and updates.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input type="email" placeholder="Your email" className="w-full px-3 py-2 rounded-md border bg-transparent text-sm" />
                <button className="px-4 py-2 bg-primary text-white rounded-md">Subscribe</button>
              </form>
              <div className="flex items-center gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">FB</a>
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">TW</a>
                <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">IG</a>
              </div>
            </div>
          </div>

          <div className="border-t mt-10 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rebooked Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

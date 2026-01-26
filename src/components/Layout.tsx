import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToTopSmooth = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToTopSmooth();
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));
    unsub = data.subscription.unsubscribe;
    return () => { if (unsub) unsub(); };
  }, []);

  const handleFooterNav = (e: React.MouseEvent, path: string) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTopSmooth();
    }
  };

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Modern Navbar with scroll animation */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "navbar-solid py-3"
            : "navbar-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isScrolled ? "bg-primary" : "bg-primary"
              )}>
                <Home className="text-primary-foreground w-5 h-5" />
              </div>
              <span className={cn(
                "text-lg font-semibold tracking-tight transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-foreground"
              )}>
                Rebook Living
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Auth Buttons */}
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <Link to="/profile">
                    <Button variant="ghost" className="rounded-full gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" className="rounded-full">
                        Register
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button className="rounded-full px-6">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isAdmin && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          {!isAdmin && isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <Link
                  to={isLoggedIn ? "/profile" : "/auth"}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  {isLoggedIn ? "Profile" : "Sign In"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Rebook Living</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connecting South African students with quality, verified accommodation near universities.
              </p>
              <div className="mt-6 text-xs text-muted-foreground">
                Powered by Rebooked Solutions
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Explore</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/browse" 
                    onClick={(e) => handleFooterNav(e, '/browse')} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    onClick={(e) => handleFooterNav(e, '/about')} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    onClick={(e) => handleFooterNav(e, '/contact')} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/profile" 
                    onClick={(e) => handleFooterNav(e, '/profile')} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/rebookd.living/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Rebooked Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const scrollToTopSmooth = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Smooth scroll to top on navigation (route changes)
    scrollToTopSmooth();
  }, [location.pathname]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));
    unsub = data.subscription.unsubscribe;
    return () => { if (unsub) unsub(); };
  }, []);

  const { toast } = useToast();
  const [subscriber, setSubscriber] = useState({ firstname: '', lastname: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFooterNav = (e: React.MouseEvent, path: string) => {
    // If clicking a footer link that points to the current page, prevent navigation and scroll to top
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTopSmooth();
    } else {
      // allow navigation; the route change effect will scroll
    }
  };

  const handleSubscribe = async (e: any) => {
    e.preventDefault();
    if (!subscriber.email) { toast({ title: 'Error', description: 'Email is required', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    try {
      const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL || (import.meta.env as any).SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
      const functionsOrigin = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      // Ensure no trailing slash
      const url = `${functionsOrigin.replace(/\/+$/, '')}/add-subscriber`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriber.email, firstname: subscriber.firstname, lastname: subscriber.lastname }),
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
      if (!res.ok) throw new Error(data?.error || 'Subscription failed');
      toast({ title: 'Subscribed', description: 'Thanks for subscribing!' });
      setSubscriber({ firstname: '', lastname: '', email: '' });
    } catch (err: any) {
      toast({ title: 'Subscription failed', description: err.message || 'Could not subscribe', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

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
                <Link to="/browse" className="text-base font-medium hover:underline underline-offset-4">
                  Browse
                </Link>
                <Link to="/about" className="text-base font-medium hover:underline underline-offset-4">
                  About
                </Link>
                <Link to="/contact" className="text-base font-medium hover:underline underline-offset-4">
                  Contact
                </Link>
                <Link to={isLoggedIn ? "/profile" : "/auth"} className="text-base font-medium hover:underline underline-offset-4">
                  {isLoggedIn ? "Profile" : "Sign In"}
                </Link>
              </div>
            )}

            {!isAdmin && (
              <div className="md:hidden flex items-center gap-2">
                <Link to="/browse">
                  <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to={isLoggedIn ? "/profile" : "/auth"}>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
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
                <li><Link to="/browse" onClick={(e) => handleFooterNav(e, '/browse')} className="text-muted-foreground hover:text-primary">Browse Listings</Link></li>
                <li><Link to="/about" onClick={(e) => handleFooterNav(e, '/about')} className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" onClick={(e) => handleFooterNav(e, '/contact')} className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link to="/profile" onClick={(e) => handleFooterNav(e, '/profile')} className="text-muted-foreground hover:text-primary">My Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Stay in the loop</h4>
              <p className="text-sm text-muted-foreground mb-3">Subscribe for new listings and updates.</p>
              <form onSubmit={handleSubscribe} className="space-y-2 w-full">
                <div className="flex gap-2 w-full">
                  <input type="text" placeholder="First name" value={subscriber.firstname} onChange={(e) => setSubscriber({ ...subscriber, firstname: e.target.value })} className="flex-1 px-3 py-2 rounded-md border bg-transparent text-sm min-w-0" />
                  <input type="text" placeholder="Last name" value={subscriber.lastname} onChange={(e) => setSubscriber({ ...subscriber, lastname: e.target.value })} className="flex-1 px-3 py-2 rounded-md border bg-transparent text-sm min-w-0" />
                </div>
                <div className="flex gap-2 items-center w-full">
                  <input type="email" placeholder="Your email" value={subscriber.email} onChange={(e) => setSubscriber({ ...subscriber, email: e.target.value })} className="flex-1 px-3 py-2 rounded-md border bg-transparent text-sm min-w-0" />
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md whitespace-nowrap flex-shrink-0" disabled={isSubmitting}>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</button>
                </div>
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

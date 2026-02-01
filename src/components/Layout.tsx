import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIAssistantBubble } from "@/components/AIAssistantBubble";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });
    unsub = data.subscription.unsubscribe;
    return () => { if (unsub) unsub(); };
  }, []);

  const [userId, setUserId] = useState<string | null>(null);

  // Fetch unread notification count
  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications", userId],
    queryFn: async () => {
      if (!userId) return 0;

      // Get all notifications for this user
      const { data: notifs } = await supabase
        .from("notifications")
        .select("id")
        .or(`target_user_id.is.null,target_user_id.eq.${userId}`);

      if (!notifs?.length) return 0;

      // Get read notifications
      const { data: readNotifs } = await supabase
        .from("user_notifications")
        .select("notification_id")
        .eq("user_id", userId)
        .eq("is_read", true);

      const readIds = new Set(readNotifs?.map((r) => r.notification_id) || []);
      return notifs.filter((n) => !readIds.has(n.id)).length;
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });

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
    <>
      <div className="min-h-screen flex flex-col pt-16">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
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
                <Link to="/campus-guide" className="text-base font-medium hover:underline underline-offset-4">
                  ReBooked Campus
                </Link>
                <Link to="/travel" className="text-base font-medium hover:underline underline-offset-4 flex items-center gap-2">
                  Travel
                  <Badge variant="outline" className="text-xs px-2 py-0.5">Beta</Badge>
                </Link>
                {isLoggedIn && (
                  <Link to="/notifications" className="relative text-base font-medium hover:underline underline-offset-4">
                    <Bell className="w-5 h-5" />
                    {(unreadCount || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link to={isLoggedIn ? "/profile" : "/auth"} className="text-base font-medium hover:underline underline-offset-4">
                  {isLoggedIn ? "Profile" : "Sign In"}
                </Link>
              </div>
            )}

            {!isAdmin && (
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/browse" className="cursor-pointer">
                        Browse
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/campus-guide" className="cursor-pointer">
                        ReBooked Campus
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/travel" className="cursor-pointer flex items-center gap-2">
                        Travel
                        <Badge variant="outline" className="text-xs px-2 py-0.5">Beta</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/pricing" className="cursor-pointer">
                        Pricing
                      </Link>
                    </DropdownMenuItem>
                    {isLoggedIn && (
                      <DropdownMenuItem asChild>
                        <Link to="/notifications" className="cursor-pointer flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Notifications
                          {(unreadCount || 0) > 0 && (
                            <span className="ml-auto w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={isLoggedIn ? "/profile" : "/auth"} className="cursor-pointer">
                        {isLoggedIn ? "Profile" : "Sign In"}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <AIAssistantBubble />

      <footer className="border-t bg-gradient-to-b from-background/50 to-background/30 backdrop-blur mt-auto">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="text-primary-foreground w-4 h-4" />
                </div>
                <span className="font-bold text-lg">Rebook Living</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Finding quality student accommodation made simple and affordable.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="https://www.instagram.com/rebooked.living/" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full bg-primary items-center justify-center text-primary-foreground hover:shadow-lg transition-all hover:scale-110" title="Follow us on Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61585625007986" target="_blank" rel="noopener noreferrer" className="inline-flex w-10 h-10 rounded-full bg-primary items-center justify-center text-primary-foreground hover:shadow-lg transition-all hover:scale-110" title="Follow us on Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-5">Explore</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse" onClick={(e) => handleFooterNav(e, '/browse')} className="text-muted-foreground hover:text-primary transition-colors">Browse Listings</Link></li>
                <li><Link to="/campus-guide" onClick={(e) => handleFooterNav(e, '/campus-guide')} className="text-muted-foreground hover:text-primary transition-colors">ReBooked Campus</Link></li>
                <li><Link to="/travel" onClick={(e) => handleFooterNav(e, '/travel')} className="text-muted-foreground hover:text-primary transition-colors">Travel Guide</Link></li>
                <li><Link to="/pricing" onClick={(e) => handleFooterNav(e, '/pricing')} className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/profile" onClick={(e) => handleFooterNav(e, '/profile')} className="text-muted-foreground hover:text-primary transition-colors">My Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-5">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-5">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.instagram.com/rebooked.solutions" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors underline">Powered by Rebooked Solutions</a></li>
                <li><p className="text-xs text-muted-foreground/70">Connecting South African students with quality accommodation since 2025</p></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rebooked Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Layout;

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import Ad from "./pages/Ad";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/admin/Dashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";

import NotFound from "./pages/NotFound";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { ComponentType } from "react";

// Vercel Analytics is optional. We attempt to dynamically load it so the app won't crash if the
// package is not installed. To enable analytics, add '@vercel/analytics' to dependencies and
// install packages.
let AnalyticsComponent: ComponentType | null = null;
(async () => {
  try {
    const mod = await import('@vercel/analytics/react');
    AnalyticsComponent = mod.Analytics ?? null;
  } catch (e) {
    // package not installed; ignore
    AnalyticsComponent = null;
  }
})();

const queryClient = new QueryClient();

const App = () => {
  const AuthRedirector = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/profile");
        }
      });

      return () => subscription.unsubscribe && subscription.unsubscribe();
    }, [navigate]);

    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthRedirector />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/ad" element={<Ad />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/panel" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {AnalyticsComponent ? <AnalyticsComponent /> : null}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

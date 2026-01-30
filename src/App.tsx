import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Maintenance from "./pages/Maintenance";
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
import Campus from "./pages/Campus";
import LandlordDashboard from "./pages/landlord/Dashboard";
import AddListing from "./pages/landlord/AddListing";
import LandlordPayment from "./pages/landlord/Payment";
import PaymentResult from "./pages/PaymentResult";

import NotFound from "./pages/NotFound";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedLandlordRoute from "./components/ProtectedLandlordRoute";
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
            {/* Maintenance Mode - All routes redirect to maintenance page */}
            <Route path="*" element={<Maintenance />} />
          </Routes>
          {AnalyticsComponent ? <AnalyticsComponent /> : null}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

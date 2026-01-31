import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AccessStatus {
  accessLevel: "free" | "paid";
  hasActivePayment: boolean;
  paymentType?: "weekly" | "monthly";
  expiresAt?: string;
  isLoading: boolean;
}

export const useAccessControl = () => {
  const [status, setStatus] = useState<AccessStatus>({
    accessLevel: "free",
    hasActivePayment: false,
    isLoading: true,
  });

  const checkAccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setStatus({
          accessLevel: "free",
          hasActivePayment: false,
          isLoading: false,
        });
        return;
      }

      // Check for successful payment directly in database
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "successful")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking access:", error);
        setStatus({
          accessLevel: "free",
          hasActivePayment: false,
          isLoading: false,
        });
        return;
      }

      if (payments && payments.length > 0) {
        const payment = payments[0];
        // Calculate expiry date based on created_at and duration_days from metadata
        const duration_days = payment.metadata?.duration_days || 30;
        const createdAt = new Date(payment.created_at);
        const expiresAt = new Date(createdAt.getTime() + duration_days * 24 * 60 * 60 * 1000);

        if (expiresAt > new Date()) {
          setStatus({
            accessLevel: "paid",
            hasActivePayment: true,
            paymentType: payment.subscription_plan as "weekly" | "monthly",
            expiresAt: expiresAt.toISOString(),
            isLoading: false,
          });
        } else {
          setStatus({
            accessLevel: "free",
            hasActivePayment: false,
            isLoading: false,
          });
        }
      } else {
        setStatus({
          accessLevel: "free",
          hasActivePayment: false,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Access check error:", err);
      setStatus({
        accessLevel: "free",
        hasActivePayment: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAccess();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => subscription.unsubscribe();
  }, [checkAccess]);

  return { ...status, refresh: checkAccess };
};

// Constants for free tier limits
export const FREE_TIER_LIMITS = {
  MAX_PHOTOS: 3,
  MAX_REVIEWS: 1,
  MAP_ENABLED: false,
  SATELLITE_ENABLED: false,
  ADS_ENABLED: true,
};

export const PAID_TIER_LIMITS = {
  MAX_PHOTOS: Infinity,
  MAX_REVIEWS: Infinity,
  MAP_ENABLED: true,
  SATELLITE_ENABLED: true,
  ADS_ENABLED: false,
};

// Helper to get limits based on access level
export const getAccessLimits = (accessLevel: "free" | "paid") => {
  return accessLevel === "paid" ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;
};

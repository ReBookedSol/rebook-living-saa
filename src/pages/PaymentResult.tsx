import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Home, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useConfetti } from "@/hooks/useConfetti";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh: refreshAccessControl } = useAccessControl();
  const { triggerConfetti } = useConfetti();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState<{
    type?: string;
    expiresAt?: string;
  }>({});
  const pollCountRef = useRef(0);

  const paymentId = searchParams.get("payment_id");

  // Server-side poll that also checks BobPay API directly as a fallback
  const pollPaymentServer = async (): Promise<boolean> => {
    if (!paymentId) return false;

    try {
      const response = await fetch(
        `https://gzihagvdpdjcoyjpvyvs.supabase.co/functions/v1/bobpay/poll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aWhhZ3ZkcGRqY295anB2eXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM2NzQsImV4cCI6MjA3NzE0OTY3NH0.2y2vuzaq9dKDrJIyjbAfcNAgrxVEpxeYwS5xNHSrqYw",
          },
          body: JSON.stringify({ custom_payment_id: paymentId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.found && (data.status === "successful" || data.status === "active")) {
          setStatus("success");
          setPaymentDetails({
            type: data.payment_type,
            expiresAt: data.access_expires_at,
          });
          if (data.recovered) {
            console.log("✅ Payment recovered via server-side polling!");
          }
          return true;
        }
      }
    } catch (err) {
      console.error("Server poll error:", err);
    }
    return false;
  };

  // Client-side DB check
  const verifyPayment = async (): Promise<boolean> => {
    if (!paymentId) {
      setStatus("failed");
      return false;
    }

    try {
      const { data: payment, error } = await supabase
        .from("user_payments")
        .select("*")
        .eq("custom_payment_id", paymentId)
        .maybeSingle();

      if (error || !payment) {
        return false;
      }

      if (payment.status === "successful" || payment.status === "active") {
        setStatus("success");
        setPaymentDetails({
          type: payment.payment_type,
          expiresAt: payment.access_expires_at,
        });
        return true;
      } else if (payment.status === "pending") {
        setStatus("pending");
        return false;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      return false;
    }
  };

  // Combined verification: try DB first, then server-side poll with BobPay API fallback
  const fullVerify = async () => {
    // Try DB first (fast)
    const dbFound = await verifyPayment();
    if (dbFound) return;

    // If not in DB yet, use server-side poll which checks BobPay API directly
    pollCountRef.current += 1;
    setPollCount(pollCountRef.current);
    
    // After 3 client-side checks, start using server-side polling
    if (pollCountRef.current >= 3) {
      const serverFound = await pollPaymentServer();
      if (serverFound) return;
    }

    // Still pending
    if (status === "loading") {
      setStatus("pending");
    }
  };

  useEffect(() => {
    fullVerify();

    // Poll every 3 seconds, with server-side fallback kicking in after ~9 seconds
    const pollInterval = setInterval(() => {
      if (status !== "success") {
        fullVerify();
      }
    }, 3000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (status !== "success") {
        setStatus("failed");
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [paymentId]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-redirect to browse page after 5 seconds if payment is successful
  useEffect(() => {
    if (status === "success") {
      refreshAccessControl();

      if (!confettiTriggered) {
        setConfettiTriggered(true);
        triggerConfetti();
      }

      sessionStorage.setItem("justPaid", "true");

      const redirectTimer = setTimeout(() => {
        navigate("/browse");
      }, 5000);
      return () => clearTimeout(redirectTimer);
    }
  }, [status, navigate, refreshAccessControl, triggerConfetti, confettiTriggered]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fullVerify();
    setIsRefreshing(false);
  };

  const resultContent = {
    loading: {
      icon: <Clock className="w-16 h-16 text-muted-foreground animate-pulse" />,
      title: "Verifying Payment...",
      description: "Please wait while we confirm your payment.",
      bgColor: "bg-muted",
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Payment Successful!",
      description: `Your ${paymentDetails.type === "weekly" ? "5-Day" : "Monthly"} pass is now active. Enjoy unlimited access to all photos, reviews, maps, and more!`,
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />,
      title: "Payment Processing",
      description: `Your payment is being confirmed. We're actively checking with our payment provider${pollCount > 5 ? " (this may take a moment)" : ""}. Please don't close this page.`,
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-destructive" />,
      title: "Payment Issue",
      description: "We couldn't confirm your payment. If you completed payment, please contact support at support@rebookedsolutions.co.za with your payment reference and we'll sort it out immediately.",
      bgColor: "bg-destructive/10",
    },
  };

  const content = resultContent[status];

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card className={content.bgColor}>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {content.icon}
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">{content.description}</p>

            {status === "success" && paymentDetails.expiresAt && (
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Access expires on</p>
                <p className="font-semibold">
                  {new Date(paymentDetails.expiresAt).toLocaleDateString("en-ZA", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {(status === "pending" || status === "failed") && paymentId && (
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-xs break-all">{paymentId}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {status === "success" && (
                <Button onClick={() => navigate("/browse")} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Browse Accommodations (auto-redirect in 5s)
                </Button>
              )}
              {status === "pending" && (
                <>
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full"
                  >
                    <RotateCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Checking..." : "Check Status"}
                  </Button>
                  <Button
                    onClick={() => navigate("/browse")}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Continue to Browse
                  </Button>
                </>
              )}
              {status === "failed" && (
                <>
                  <Button onClick={handleRefresh} className="w-full">
                    <RotateCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/pricing")}>
                    Back to Pricing
                  </Button>
                  <a 
                    href="mailto:support@rebookedsolutions.co.za" 
                    className="text-sm text-primary underline mt-2"
                  >
                    Contact Support
                  </a>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentResult;

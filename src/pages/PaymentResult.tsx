import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Home, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh: refreshAccessControl } = useAccessControl();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "failed">("loading");
  const [paymentDetails, setPaymentDetails] = useState<{
    type?: string;
    expiresAt?: string;
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const paymentId = searchParams.get("payment_id");

  const verifyPayment = async () => {
    if (!paymentId) {
      setStatus("failed");
      return;
    }

    try {
      // Check payment status in database using custom_payment_id
      const { data: payment, error } = await supabase
        .from("user_payments")
        .select("*")
        .eq("custom_payment_id", paymentId)
        .maybeSingle();

      if (error || !payment) {
        setStatus("pending");
        return;
      }

      if (payment.status === "successful" || payment.status === "active") {
        setStatus("success");
        setPaymentDetails({
          type: payment.payment_type,
          expiresAt: payment.access_expires_at,
        });
      } else if (payment.status === "pending") {
        setStatus("pending");
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setStatus("pending");
    }
  };

  useEffect(() => {
    verifyPayment();

    // Poll for status updates every 2 seconds
    const pollInterval = setInterval(() => {
      verifyPayment();
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [paymentId]);

  // Auto-redirect to browse page after 5 seconds if payment is successful
  useEffect(() => {
    if (status === "success") {
      // Refresh access control status
      refreshAccessControl();

      // Mark user as newly paid for animation
      sessionStorage.setItem("justPaid", "true");

      const redirectTimer = setTimeout(() => {
        navigate("/browse");
      }, 5000);
      return () => clearTimeout(redirectTimer);
    }
  }, [status, navigate, refreshAccessControl]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await verifyPayment();
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
      description: `Your ${paymentDetails.type} pass is now active. Enjoy unlimited access to all photos, reviews, maps, and more!`,
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500" />,
      title: "Payment Processing",
      description: "Your payment is being confirmed. We're checking the status and will activate your access shortly. This usually takes 5-10 seconds.",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-destructive" />,
      title: "Payment Failed",
      description: "Something went wrong with your payment. Please try again or contact support.",
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
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentResult;

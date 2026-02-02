import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff, Check, CheckCheck, ExternalLink, Info, AlertTriangle, Megaphone, Crown, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["user-notifications", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get notifications targeted to this user or general notifications
      const { data: notifs, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`target_user_id.is.null,target_user_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get read status for this user
      const { data: readStatus } = await supabase
        .from("user_notifications")
        .select("notification_id, is_read, read_at")
        .eq("user_id", userId);

      const readMap = new Map(readStatus?.map((r) => [r.notification_id, r]) || []);

      return notifs?.map((n) => ({
        ...n,
        is_read: readMap.get(n.id)?.is_read || false,
        read_at: readMap.get(n.id)?.read_at || null,
      })) || [];
    },
    enabled: !!userId,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) return;

      // Upsert user_notifications
      const { error } = await supabase
        .from("user_notifications")
        .upsert({
          user_id: userId,
          notification_id: notificationId,
          is_read: true,
          read_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,notification_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications", userId] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !notifications) return;

      const unreadNotifs = notifications.filter((n) => !n.is_read);
      if (unreadNotifs.length === 0) return;

      const { error } = await supabase
        .from("user_notifications")
        .upsert(
          unreadNotifs.map((n) => ({
            user_id: userId,
            notification_id: n.id,
            is_read: true,
            read_at: new Date().toISOString(),
          })),
          { onConflict: "user_id,notification_id" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications", userId] });
    },
  });

  const getIcon = (type: string, priority: string | null) => {
    if (priority === "high") return <AlertTriangle className="w-5 h-5 text-destructive" />;
    
    switch (type) {
      case "announcement":
        return <Megaphone className="w-5 h-5 text-primary" />;
      case "info":
        return <Info className="w-5 h-5 text-primary" />;
      case "subscription":
        return <Crown className="w-5 h-5 text-green-500" />;
      case "subscription_expiring":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "subscription_expired":
        return <Crown className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  if (!userId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <BellOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your notifications
              </p>
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with the latest announcements and updates
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Stats */}
          {notifications && notifications.length > 0 && (
            <div className="flex gap-4 mb-6">
              <Badge variant="secondary" className="text-sm py-1 px-3">
                {notifications.length} total
              </Badge>
              {unreadCount > 0 && (
                <Badge className="text-sm py-1 px-3">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!notifications || notifications.length === 0) && (
            <Card className="text-center py-16">
              <CardContent>
                <BellOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                <p className="text-muted-foreground">
                  You'll see announcements and updates here
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notifications List */}
          {!isLoading && notifications && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all ${
                    !notification.is_read
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.is_read ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          {getIcon(notification.type, notification.priority)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{notification.title}</h3>
                            <p className="text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {notification.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Important
                            </Badge>
                          )}
                          {notification.accommodation_id && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-primary"
                              onClick={() => navigate(`/listing/${notification.accommodation_id}`)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Listing
                            </Button>
                          )}
                          {(notification.type === "subscription_expiring" || notification.type === "subscription_expired") && (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-auto py-1 px-3"
                              onClick={() => navigate("/pricing")}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              Renew Access
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Eye, 
  Clock, 
  MessageSquare, 
  Heart, 
  Share2, 
  Activity,
  Users,
  TrendingUp,
  Calendar,
  Search,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const AnalyticsTab = () => {
  const [dateRange, setDateRange] = useState("7");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch listing analytics
  const { data: listingAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["listing-analytics", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      
      const { data, error } = await supabase
        .from("listing_analytics_daily")
        .select(`
          *,
          accommodations:accommodation_id (
            property_name,
            university,
            city
          )
        `)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch activity logs
  const { data: activityLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["activity-logs", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          accommodations:accommodation_id (
            property_name
          ),
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Aggregate stats
  const aggregateStats = listingAnalytics?.reduce((acc, item) => {
    return {
      totalViews: acc.totalViews + (item.views || 0),
      totalMessages: acc.totalMessages + (item.messages || 0),
      totalFavorites: acc.totalFavorites + (item.favorites || 0),
      totalShares: acc.totalShares + (item.shares || 0),
    };
  }, { totalViews: 0, totalMessages: 0, totalFavorites: 0, totalShares: 0 }) || { totalViews: 0, totalMessages: 0, totalFavorites: 0, totalShares: 0 };

  // Group analytics by listing
  const listingStats = listingAnalytics?.reduce((acc: Record<string, any>, item) => {
    const id = item.accommodation_id;
    if (!acc[id]) {
      acc[id] = {
        id,
        property_name: (item.accommodations as any)?.property_name || "Unknown",
        university: (item.accommodations as any)?.university || "",
        city: (item.accommodations as any)?.city || "",
        views: 0,
        messages: 0,
        favorites: 0,
        shares: 0,
      };
    }
    acc[id].views += item.views || 0;
    acc[id].messages += item.messages || 0;
    acc[id].favorites += item.favorites || 0;
    acc[id].shares += item.shares || 0;
    return acc;
  }, {}) || {};

  const sortedListings = Object.values(listingStats)
    .filter((item: any) => 
      !searchTerm || 
      item.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.university?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => b.views - a.views);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">Track listing performance and user activity</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => { refetchAnalytics(); refetchLogs(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{aggregateStats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold">{aggregateStats.totalMessages.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{aggregateStats.totalFavorites.toLocaleString()}</p>
              </div>
              <Heart className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold">{aggregateStats.totalShares.toLocaleString()}</p>
              </div>
              <Share2 className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">Listing Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Listings Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Messages</TableHead>
                    <TableHead className="text-center">Favorites</TableHead>
                    <TableHead className="text-center">Shares</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : sortedListings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No analytics data found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedListings.map((listing: any) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          {listing.property_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {listing.university || listing.city || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{listing.views}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{listing.messages}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{listing.favorites}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{listing.shares}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>User actions across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : activityLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityLogs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.profiles?.email || log.user_id?.slice(0, 8) || "Anonymous"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.event_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.accommodations?.property_name || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.duration_seconds ? `${log.duration_seconds}s` : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;

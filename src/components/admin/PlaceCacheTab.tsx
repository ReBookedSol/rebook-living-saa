import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Database, Image, MessageSquare, Clock, CheckCircle2, Trash2, RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { toast } from "sonner";

interface PlaceCacheRow {
  place_id: string;
  cached_at: string;
  photo_count: number;
  review_count: number;
  cached_tier: string;
  attributions: string | null;
}

interface CacheAnalytics {
  date: string;
  cache_hits: number;
  cache_misses: number;
  api_calls_saved: number;
}

const PlaceCacheTab = () => {
  const queryClient = useQueryClient();

  const { data: cacheStats } = useQuery({
    queryKey: ["place-cache-stats"],
    queryFn: async () => {
      const [totalResult, proResult] = await Promise.all([
        supabase.from("place_cache").select("*", { count: "exact", head: true }),
        supabase.from("place_cache").select("*", { count: "exact", head: true }).eq("cached_tier", "pro"),
      ]);

      const { data: aggregates } = await supabase
        .from("place_cache")
        .select("photo_count, review_count");

      const totalPhotos = aggregates?.reduce((sum, row) => sum + (row.photo_count || 0), 0) || 0;
      const totalReviews = aggregates?.reduce((sum, row) => sum + (row.review_count || 0), 0) || 0;

      return {
        total_places: totalResult.count || 0,
        pro_tier_count: proResult.count || 0,
        total_photos: totalPhotos,
        total_reviews: totalReviews,
      };
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["place-cache-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_cache_analytics")
        .select("*")
        .order("date", { ascending: false })
        .limit(7);
      
      if (error) throw error;
      return data as CacheAnalytics[];
    },
  });

  // Calculate totals from analytics
  const totalHits = analytics?.reduce((sum, a) => sum + (a.cache_hits || 0), 0) || 0;
  const totalMisses = analytics?.reduce((sum, a) => sum + (a.cache_misses || 0), 0) || 0;
  const totalSaved = analytics?.reduce((sum, a) => sum + (a.api_calls_saved || 0), 0) || 0;
  const hitRate = totalHits + totalMisses > 0 ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) : "0";

  const { data: recentCaches, isLoading: cachesLoading } = useQuery({
    queryKey: ["place-cache-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("place_cache")
        .select("place_id, cached_at, photo_count, review_count, cached_tier, attributions")
        .order("cached_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as PlaceCacheRow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const { error } = await supabase
        .from("place_cache")
        .delete()
        .eq("place_id", placeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-cache-stats"] });
      queryClient.invalidateQueries({ queryKey: ["place-cache-recent"] });
      toast.success("Cache entry deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async (placeId: string) => {
      // Mark as expired by setting cached_at to old date, next view will refresh
      const { error } = await supabase
        .from("place_cache")
        .update({ 
          cached_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq("place_id", placeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-cache-recent"] });
      toast.success("Cache marked for refresh - will update on next view");
    },
    onError: (error) => {
      toast.error("Failed to mark for refresh: " + error.message);
    },
  });

  const clearAllExpiredMutation = useMutation({
    mutationFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("place_cache")
        .delete()
        .lt("cached_at", thirtyDaysAgo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-cache-stats"] });
      queryClient.invalidateQueries({ queryKey: ["place-cache-recent"] });
      toast.success("Expired cache entries cleared");
    },
    onError: (error) => {
      toast.error("Failed to clear: " + error.message);
    },
  });

  const isExpired = (cachedAt: string) => {
    const cacheDate = new Date(cachedAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return cacheDate < thirtyDaysAgo;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cached Places</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.total_places || 0}</div>
            <p className="text-xs text-muted-foreground">Total places in cache</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Tier Cached</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.pro_tier_count || 0}</div>
            <p className="text-xs text-muted-foreground">Full data cached</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.total_photos || 0}</div>
            <p className="text-xs text-muted-foreground">Photos in cache</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.total_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">Reviews in cache</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{hitRate}%</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHits}</div>
            <p className="text-xs text-muted-foreground">Requests served from cache</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMisses}</div>
            <p className="text-xs text-muted-foreground">Required API calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Saved</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalSaved}</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cache Policy
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => clearAllExpiredMutation.mutate()}
            disabled={clearAllExpiredMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Expired
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Cache Duration:</strong> 30 days from last fetch</p>
          <p>• <strong>Max Photos:</strong> 10 per place (pro tier)</p>
          <p>• <strong>Max Reviews:</strong> 5 per place</p>
          <p>• <strong>Display Limits:</strong> Browse: 1 photo | Free: 3 photos + 1 review | Pro: 10 photos + 5 reviews</p>
          <p>• <strong>API Savings:</strong> Each cached place saves ~90% of API calls</p>
          <p>• <strong>Auto Cleanup:</strong> Cron job runs every 10 minutes to remove expired entries</p>
        </CardContent>
      </Card>

      {/* Recent Caches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cache Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place ID</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Cached At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cachesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading cache entries...
                  </TableCell>
                </TableRow>
              ) : recentCaches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No cached places yet
                  </TableCell>
                </TableRow>
              ) : (
                recentCaches?.map((cache) => (
                  <TableRow key={cache.place_id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate" title={cache.place_id}>
                      {cache.place_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Image className="h-3 w-3" />
                        {cache.photo_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {cache.review_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cache.cached_tier === "pro" ? "bg-primary" : "bg-muted text-muted-foreground"}
                      >
                        {cache.cached_tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(cache.cached_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {isExpired(cache.cached_at) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge className="bg-green-500">Valid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => refreshMutation.mutate(cache.place_id)}
                          disabled={refreshMutation.isPending}
                          title="Mark for refresh"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(cache.place_id)}
                          disabled={deleteMutation.isPending}
                          title="Delete cache entry"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceCacheTab;

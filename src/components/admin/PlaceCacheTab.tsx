import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Database, Image, MessageSquare, Clock, CheckCircle2 } from "lucide-react";

interface PlaceCacheRow {
  place_id: string;
  cached_at: string;
  photo_count: number;
  review_count: number;
  cached_tier: string;
  attributions: string | null;
}

const PlaceCacheTab = () => {
  const { data: cacheStats, isLoading: statsLoading } = useQuery({
    queryKey: ["place-cache-stats"],
    queryFn: async () => {
      const [totalResult, proResult] = await Promise.all([
        supabase.from("place_cache").select("*", { count: "exact", head: true }),
        supabase.from("place_cache").select("*", { count: "exact", head: true }).eq("cached_tier", "pro"),
      ]);

      // Get total photos and reviews
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

      {/* Cache Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cache Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Cache Duration:</strong> 30 days from last fetch</p>
          <p>• <strong>Max Photos:</strong> 10 per place (pro tier)</p>
          <p>• <strong>Max Reviews:</strong> 5 per place</p>
          <p>• <strong>Display Limits:</strong> Browse: 1 photo | Free: 3 photos + 1 review | Pro: 10 photos + 5 reviews</p>
          <p>• <strong>API Savings:</strong> Each cached place saves ~90% of API calls</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {cachesLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading cache entries...
                  </TableCell>
                </TableRow>
              ) : recentCaches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "./ReviewCard";
import { Star } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ReviewsListProps {
  accommodationId?: string;
  isAdmin?: boolean;
  filterFlagged?: boolean;
  onReviewsUpdated?: () => void;
}

export const ReviewsList = ({
  accommodationId,
  isAdmin = false,
  filterFlagged = false,
  onReviewsUpdated,
}: ReviewsListProps) => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["reviews", accommodationId, filterFlagged],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(
          `*,
          review_stats(like_count, reply_count)
        `
        );

      if (!isAdmin) {
        query = query.eq("is_hidden", false);
        if (!filterFlagged) {
          query = query.eq("is_flagged", false);
        }
      }

      if (filterFlagged) {
        query = query.eq("is_flagged", true);
      }

      if (accommodationId) {
        query = query.eq("accommodation_id", accommodationId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate average rating
  const averageRating = reviews
    ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1)
    : "0";

  const handleReviewUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    onReviewsUpdated?.();
  };

  if (error) {
    return (
      <Card className="reviews-list-error">
        <CardHeader>
          <CardTitle>Error Loading Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load reviews. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="reviews-list-skeleton">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasReviews = reviews && reviews.length > 0;

  return (
    <div className="reviews-list-container space-y-6">
      {/* Reviews Summary */}
      {hasReviews && !isAdmin && (
        <Card className="reviews-summary">
          <CardHeader>
            <CardTitle>Reviews Summary</CardTitle>
          </CardHeader>
          <CardContent className="reviews-summary-content">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold">{averageRating}</span>
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-6 space-y-2 reviews-rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-12">{rating}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {hasReviews ? (
        <div className="reviews-list-items space-y-4">
          {isAdmin && filterFlagged && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  Showing {reviews.length} flagged review(s) requiring moderation
                </p>
              </CardContent>
            </Card>
          )}
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                stats: {
                  like_count: review.review_stats?.[0]?.like_count || 0,
                  reply_count: review.review_stats?.[0]?.reply_count || 0,
                },
              }}
              isAdmin={isAdmin}
              onReviewUpdated={handleReviewUpdated}
              onReplyAdded={handleReviewUpdated}
            />
          ))}
        </div>
      ) : (
        <Card className="reviews-list-empty">
          <CardHeader>
            <CardTitle>No Reviews Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {filterFlagged
                ? "No flagged reviews to moderate"
                : "Be the first to review this accommodation!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

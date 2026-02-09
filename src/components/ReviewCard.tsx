import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, ThumbsUp, MessageCircle, Flag, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { ReviewReplyForm } from "./ReviewReplyForm";

interface ReviewCardProps {
  review: Tables<"reviews"> & {
    user?: { email?: string };
    stats?: { like_count?: number; reply_count?: number };
  };
  onReplyAdded?: () => void;
  onReviewUpdated?: () => void;
}

export const ReviewCard = ({ review, onReplyAdded, onReviewUpdated }: ReviewCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.stats?.like_count || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      setCurrentUserId(userId || null);
      setIsLoggedIn(!!userId);

      if (userId && review.id) {
        // Check if user has already liked this review
        const { data } = await supabase
          .from("review_likes")
          .select("id")
          .eq("review_id", review.id)
          .eq("user_id", userId)
          .single();
        setIsLiked(!!data);
      }
    };
    checkAuth();
  }, [review.id]);

  // Fetch replies for this review
  const { data: replies } = useQuery({
    queryKey: ["review-replies", review.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_replies")
        .select("*")
        .eq("review_id", review.id)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", session.user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("review_likes")
          .insert([
            {
              review_id: review.id,
              user_id: session.user.id,
            },
          ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update like");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted");
      onReviewUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete review");
    },
  });

  const flagReviewMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("flagged_content").insert([
        {
          review_id: review.id,
          flag_type: "review",
          reason: "user_flagged",
          flagged_by: session.user.id,
          status: "pending",
        },
      ]);
      if (error) throw error;

      // Update review flag status
      const { error: updateError } = await supabase
        .from("reviews")
        .update({ is_flagged: true })
        .eq("id", review.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Review flagged for moderation");
      onReviewUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to flag review");
    },
  });

  const hideReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_hidden: true })
        .eq("id", review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review hidden");
      onReviewUpdated?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to hide review");
    },
  });

  const handleLike = () => {
    if (!isLoggedIn) {
      window.location.href = "/auth";
      return;
    }
    likeMutation.mutate();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const userInitial = review.user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Card className="review-card border shadow-none">
      <CardHeader className="review-header pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="review-avatar h-8 w-8">
              <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs review-author truncate">
                {review.user?.email?.split("@")[0] || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500 review-date">{formatDate(review.created_at)}</p>
            </div>
          </div>
          {currentUserId === review.user_id && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => deleteReviewMutation.mutate()}
              disabled={deleteReviewMutation.isPending}
              title="Delete your review"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="review-content pt-2 space-y-2">
        {review.is_flagged && (
          <Alert className="border-yellow-200 bg-yellow-50 py-1.5 px-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs text-yellow-800">
              Flagged for moderation
            </AlertDescription>
          </Alert>
        )}

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-700">{review.rating}/5</span>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-gray-700 review-comment line-clamp-3">{review.comment}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{replies?.length || 0}</span>
          </button>

          <button
            onClick={() => flagReviewMutation.mutate()}
            disabled={flagReviewMutation.isPending}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Flag</span>
          </button>
        </div>

        {/* Reply Form */}
        {showReplyForm && isLoggedIn && (
          <ReviewReplyForm
            reviewId={review.id}
            onReplySubmitted={() => {
              setShowReplyForm(false);
              onReplyAdded?.();
            }}
          />
        )}

        {/* Replies List */}
        {replies && replies.length > 0 && (
          <div className="mt-2 space-y-2 border-t pt-2 review-replies-list">
            {replies.map((reply) => (
              <div key={reply.id} className="pl-3 border-l border-gray-300 review-reply-item">
                <p className="text-xs text-gray-500 mb-0.5">{reply.user_id}</p>
                <p className="text-xs text-gray-700">{reply.reply_text}</p>
                {reply.is_flagged && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Flagged</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

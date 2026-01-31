import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { moderateContent, getFlagReason } from "@/lib/moderation";

interface ReviewFormProps {
  accommodationId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm = ({ accommodationId, onReviewSubmitted }: ReviewFormProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };
    checkAuth();
  }, []);

  // Check moderation on comment change
  const handleCommentChange = (value: string) => {
    setComment(value);
    if (value.trim().length > 0) {
      const moderation = moderateContent(value);
      if (!moderation.isClean) {
        setModerationWarning(getFlagReason(moderation));
      } else {
        setModerationWarning("");
      }
    } else {
      setModerationWarning("");
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      if (!accommodationId) throw new Error("Accommodation ID is required");

      // Check moderation before submitting
      const moderation = comment ? moderateContent(comment) : { isClean: true, flaggedTerms: [], severity: 'low' as const };

      const reviewData: any = {
        user_id: session.user.id,
        rating,
        comment: comment || null,
        is_flagged: !moderation.isClean,
        flag_reason: !moderation.isClean ? getFlagReason(moderation) : null,
      };

      // Add accommodation_id if column exists in schema
      if (accommodationId) {
        reviewData.accommodation_id = accommodationId;
      }

      const { error, data } = await supabase.from("reviews").insert([reviewData]).select().single();

      if (error) {
        if (error.message.includes("accommodation_id")) {
          throw new Error(
            "Database schema needs to be updated. Please run the accommodation_id migration."
          );
        }
        throw error;
      }

      // Create review stats entry
      await supabase.from("review_stats").insert([
        {
          review_id: data.id,
          like_count: 0,
          reply_count: 0,
        },
      ]);

      return data;
    },
    onSuccess: (data) => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      setHasSubmitted(true);
      setModerationWarning("");
      // Invalidate the reviews cache so the new review appears immediately
      queryClient.invalidateQueries({ queryKey: ["reviews", accommodationId] });
      onReviewSubmitted?.();
      setTimeout(() => setHasSubmitted(false), 3000);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit review");
    },
  });

  if (!isLoggedIn) {
    return (
      <Card className="review-form-card">
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please <a href="/auth" className="font-medium text-primary underline">sign in</a> to leave a review
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isValid = rating > 0;
  const hasFlag = comment && !moderateContent(comment).isClean;

  return (
    <Card className="review-form-card border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="review-form-content space-y-3">
        {hasSubmitted && (
          <Alert className="border-green-200 bg-green-50 py-2 px-3">
            <AlertDescription className="text-sm text-green-800">
              Thank you for your review!
            </AlertDescription>
          </Alert>
        )}

        {/* Star Rating */}
        <div>
          <Label className="text-sm mb-2 block">Rating *</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="review-star-button transition-all"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="review-comment" className="text-sm mb-1.5 block">
            Comment <span className="text-gray-500">(Optional)</span>
          </Label>
          <Textarea
            id="review-comment"
            placeholder="Share your feedback..."
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            maxLength={500}
            className="min-h-24 review-textarea text-sm"
          />
          <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500">
            <span>{comment.length}/500</span>
            {moderationWarning && (
              <span className="text-amber-600 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                {moderationWarning}
              </span>
            )}
          </div>
        </div>

        {hasFlag && (
          <Alert className="border-amber-200 bg-amber-50 py-2 px-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs text-amber-800">
              Your review contains flagged language and will need admin review.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!isValid || submitMutation.isPending || hasFlag}
          className="w-full review-submit-button h-9 text-sm"
          size="sm"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </CardContent>
    </Card>
  );
};

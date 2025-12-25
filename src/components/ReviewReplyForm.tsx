import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { moderateContent, getFlagReason } from "@/lib/moderation";

interface ReviewReplyFormProps {
  reviewId: string;
  onReplySubmitted?: () => void;
}

export const ReviewReplyForm = ({ reviewId, onReplySubmitted }: ReviewReplyFormProps) => {
  const [replyText, setReplyText] = useState("");
  const [moderationWarning, setModerationWarning] = useState<string>("");

  const handleTextChange = (value: string) => {
    setReplyText(value);
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
      if (!replyText.trim()) throw new Error("Reply cannot be empty");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const moderation = moderateContent(replyText);

      const { error } = await supabase.from("review_replies").insert([
        {
          review_id: reviewId,
          user_id: session.user.id,
          reply_text: replyText,
          is_flagged: !moderation.isClean,
          flag_reason: !moderation.isClean ? getFlagReason(moderation) : null,
        },
      ]);

      if (error) throw error;

      // Increment reply count
      const { data: stats } = await supabase
        .from("review_stats")
        .select("reply_count")
        .eq("review_id", reviewId)
        .single();

      if (stats) {
        await supabase
          .from("review_stats")
          .update({ reply_count: (stats.reply_count || 0) + 1 })
          .eq("review_id", reviewId);
      }
    },
    onSuccess: () => {
      toast.success("Reply submitted!");
      setReplyText("");
      setModerationWarning("");
      onReplySubmitted?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit reply");
    },
  });

  const hasFlag = replyText && !moderateContent(replyText).isClean;
  const isValid = replyText.trim().length > 0;

  return (
    <div className="review-reply-form mt-4 pt-4 border-t space-y-3">
      <Textarea
        placeholder="Share your reply..."
        value={replyText}
        onChange={(e) => handleTextChange(e.target.value)}
        maxLength={300}
        className="min-h-20"
      />

      <div className="flex justify-between items-start gap-2">
        <p className="text-xs text-gray-500">{replyText.length}/300 characters</p>
        {moderationWarning && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {moderationWarning}
          </p>
        )}
      </div>

      {hasFlag && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm text-amber-800">
            Your reply contains language that will be flagged.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={!isValid || submitMutation.isPending || hasFlag}
          size="sm"
        >
          {submitMutation.isPending ? "Submitting..." : "Reply"}
        </Button>
      </div>
    </div>
  );
};

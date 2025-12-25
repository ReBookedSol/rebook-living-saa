import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Trash2, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FlaggedContent {
  id: string;
  review_id?: string;
  reply_id?: string;
  flag_type: string;
  reason: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  review?: any;
  reply?: any;
}

const ReviewsTab = () => {
  const queryClient = useQueryClient();
  const [selectedFlagged, setSelectedFlagged] = useState<FlaggedContent | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  // Fetch flagged content
  const { data: flaggedContent, isLoading } = useQuery({
    queryKey: ["flagged-content", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("flagged_content")
        .select(
          `*,
          reviews(*),
          review_replies(*)
        `
        );

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Update flagged content status
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("flagged_content")
        .update({
          status: data.status,
          admin_notes: data.notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-content"] });
      toast.success("Status updated");
      setSelectedFlagged(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update status");
    },
  });

  // Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-content"] });
      toast.success("Review deleted");
      setSelectedFlagged(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete review");
    },
  });

  const handleApprove = () => {
    if (selectedFlagged) {
      updateStatusMutation.mutate({
        id: selectedFlagged.id,
        status: "resolved",
        notes: adminNotes,
      });
    }
  };

  const handleMarkReviewed = () => {
    if (selectedFlagged) {
      updateStatusMutation.mutate({
        id: selectedFlagged.id,
        status: "reviewed",
        notes: adminNotes,
      });
    }
  };

  const handleDelete = () => {
    if (selectedFlagged?.review_id) {
      deleteReviewMutation.mutate(selectedFlagged.review_id);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const pendingCount = flaggedContent?.filter((f) => f.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="admin-reviews-summary">
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
        </CardHeader>
        <CardContent className="admin-reviews-summary-content">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {flaggedContent?.filter((f) => f.status === "reviewed").length || 0}
              </p>
              <p className="text-sm text-gray-600">Reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {flaggedContent?.filter((f) => f.status === "resolved").length || 0}
              </p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        <Label htmlFor="status-filter" className="flex items-center">
          Status:
        </Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flagged Content Table */}
      <Card className="admin-flagged-content-card">
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedContent && flaggedContent.length > 0 ? (
            <div className="admin-flagged-content-table overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((flagged) => (
                    <TableRow key={flagged.id} className="admin-flagged-row">
                      <TableCell className="capitalize">{flagged.flag_type}</TableCell>
                      <TableCell className="text-sm text-gray-600">{flagged.reason}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(flagged.status)}>
                          {flagged.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDate(flagged.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFlagged(flagged);
                            setAdminNotes(flagged.admin_notes || "");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                {filterStatus === "pending"
                  ? "No pending items to review"
                  : "No flagged content found"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detail View Dialog */}
      <Dialog open={!!selectedFlagged} onOpenChange={(open) => !open && setSelectedFlagged(null)}>
        <DialogContent className="max-w-2xl admin-flagged-detail-dialog">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
          </DialogHeader>

          {selectedFlagged && (
            <div className="space-y-4 admin-flagged-detail-content">
              {/* Flag Details */}
              <div className="border-b pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Type</Label>
                    <p className="font-medium capitalize">{selectedFlagged.flag_type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge className={getStatusBadgeColor(selectedFlagged.status)}>
                      {selectedFlagged.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Reason</Label>
                    <p className="font-medium">{selectedFlagged.reason}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Flagged Date</Label>
                    <p className="text-sm">{formatDate(selectedFlagged.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {selectedFlagged.flag_type === "review" && selectedFlagged.reviews && (
                <div className="border-b pb-4">
                  <Label className="block mb-2">Review Content</Label>
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>This review has been flagged for moderation</AlertDescription>
                  </Alert>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium mb-2">Rating: {selectedFlagged.reviews.rating}/5</p>
                    {selectedFlagged.reviews.comment && (
                      <p className="text-sm">{selectedFlagged.reviews.comment}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedFlagged.flag_type === "reply" && selectedFlagged.review_replies && (
                <div className="border-b pb-4">
                  <Label className="block mb-2">Reply Content</Label>
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>This reply has been flagged for moderation</AlertDescription>
                  </Alert>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{selectedFlagged.review_replies.reply_text}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="border-b pb-4">
                <Label htmlFor="admin-notes" className="block mb-2">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add your notes about this content..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Existing Notes */}
              {selectedFlagged.admin_notes && (
                <div className="pb-4 bg-blue-50 p-3 rounded">
                  <Label className="text-xs text-gray-500 block mb-1">Previous Notes</Label>
                  <p className="text-sm">{selectedFlagged.admin_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleMarkReviewed}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Reviewed
                </Button>
                <Button
                  variant="default"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleApprove}
                  className="flex-1"
                >
                  Approve & Resolve
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteReviewMutation.isPending}
                  onClick={handleDelete}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsTab;

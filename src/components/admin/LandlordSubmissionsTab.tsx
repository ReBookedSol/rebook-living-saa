import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

interface LandlordListing {
  id: string;
  accommodation_id: string;
  landlord_id: string;
  submission_status: string;
  payment_status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  accommodations: any;
  landlord_documents?: any[];
}

const LandlordSubmissionsTab = () => {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState<LandlordListing | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending_review");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch landlord listings with accommodations
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-landlord-listings", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("landlord_listings")
        .select(`
          *,
          accommodations(*)
        `)
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("submission_status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch documents for selected listing
  const { data: documents } = useQuery({
    queryKey: ["landlord-documents", selectedListing?.id],
    queryFn: async () => {
      if (!selectedListing?.id) return [];
      const { data, error } = await supabase
        .from("landlord_documents")
        .select("*")
        .eq("landlord_listing_id", selectedListing.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedListing?.id,
  });

  // Approve listing mutation
  const approveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("landlord_listings")
        .update({
          submission_status: "approved",
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landlord-listings"] });
      toast.success("Listing approved successfully");
      setSelectedListing(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve listing");
    },
  });

  // Reject listing mutation
  const rejectMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("landlord_listings")
        .update({
          submission_status: "rejected",
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landlord-listings"] });
      toast.success("Listing rejected");
      setSelectedListing(null);
      setShowRejectDialog(false);
      setAdminNotes("");
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject listing");
    },
  });

  // Request changes mutation
  const requestChangesMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("landlord_listings")
        .update({
          submission_status: "changes_requested",
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landlord-listings"] });
      toast.success("Changes requested");
      setSelectedListing(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to request changes");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "changes_requested":
        return <Badge className="bg-orange-100 text-orange-800"><MessageSquare className="w-3 h-3 mr-1" />Changes</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  const pendingCount = listings?.filter(l => l.submission_status === "pending_review").length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Landlord Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {listings?.filter(l => l.submission_status === "approved").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {listings?.filter(l => l.submission_status === "rejected").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {listings?.filter(l => l.submission_status === "changes_requested").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Changes Requested</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <Label>Status:</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="changes_requested">Changes Requested</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          {listings && listings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      {listing.accommodations?.property_name || "Untitled"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {listing.accommodations?.city}, {listing.accommodations?.province}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(listing.submission_status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(listing.submitted_at || listing.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setAdminNotes(listing.admin_notes || "");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No submissions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Landlord Submission</DialogTitle>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-6">
              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Property Name</Label>
                  <p className="font-medium">{selectedListing.accommodations?.property_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedListing.accommodations?.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="font-medium">{selectedListing.accommodations?.address}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <p className="font-medium">{selectedListing.accommodations?.city}, {selectedListing.accommodations?.province}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Monthly Cost</Label>
                  <p className="font-medium">R{selectedListing.accommodations?.monthly_cost?.toLocaleString() || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">NSFAS Accredited</Label>
                  <p className="font-medium">{selectedListing.accommodations?.nsfas_accredited ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* Description */}
              {selectedListing.accommodations?.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{selectedListing.accommodations.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Person:</span>{" "}
                    {selectedListing.accommodations?.contact_person}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {selectedListing.accommodations?.contact_phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedListing.accommodations?.contact_email}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Compliance Documents
                </h4>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{doc.document_name}</span>
                          <Badge variant="outline" className="text-xs">{doc.document_type}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={`${supabase.storage.from('landlord-documents').getPublicUrl(doc.storage_path).data.publicUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                )}
              </div>

              {/* Images */}
              {selectedListing.accommodations?.image_urls?.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Property Images</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedListing.accommodations.image_urls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(url, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the landlord..."
                  className="mt-1"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={() => approveMutation.mutate(selectedListing.id)}
                  disabled={approveMutation.isPending || selectedListing.submission_status === "approved"}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => requestChangesMutation.mutate(selectedListing.id)}
                  disabled={requestChangesMutation.isPending || !adminNotes}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The landlord will be notified of the rejection.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this listing is being rejected..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedListing && rejectMutation.mutate(selectedListing.id)}
              disabled={!rejectionReason || rejectMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordSubmissionsTab;

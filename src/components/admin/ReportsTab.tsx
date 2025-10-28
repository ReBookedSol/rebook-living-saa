import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ReportsTab = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          accommodations (
            property_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete report");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">{reports?.length || 0} total reports</p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports && reports.length > 0 ? (
              reports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Link 
                      to={`/listing/${report.accommodation_id}`} 
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {report.accommodations?.property_name || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{report.reporter_name || "Anonymous"}</div>
                      <div className="text-muted-foreground">{report.reporter_email || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.details}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: report.id,
                          newStatus: report.status === "pending" ? "resolved" : "pending",
                        })
                      }
                    >
                      <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No reports yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportsTab;

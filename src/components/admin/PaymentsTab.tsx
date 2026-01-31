import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, CreditCard, UserCheck, Clock, Ban, Plus, Edit, Gift } from "lucide-react";

interface UserPayment {
  id: string;
  user_id: string;
  payment_provider: string;
  payment_type: string;
  amount: number;
  paid_at: string;
  access_expires_at: string;
  status: string;
  custom_payment_id: string;
  payment_method: string | null;
  created_at: string;
  profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

const PaymentsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<UserPayment | null>(null);
  const [grantForm, setGrantForm] = useState({
    email: "",
    paymentType: "weekly" as "weekly" | "monthly",
    days: 7,
  });
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("users_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: paymentsData, error } = await query;
      if (error) throw error;

      // Fetch profiles separately for each unique user_id
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return paymentsData?.map(payment => ({
        ...payment,
        profiles: profileMap.get(payment.user_id) || undefined,
      })) as UserPayment[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const [activeResult, totalResult, revenueResult] = await Promise.all([
        supabase
          .from("users_payments")
          .select("id", { count: "exact" })
          .eq("status", "successful")
          .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("users_payments")
          .select("id", { count: "exact" }),
        supabase
          .from("users_payments")
          .select("amount")
          .eq("status", "successful"),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        activeUsers: activeResult.count || 0,
        totalPayments: totalResult.count || 0,
        totalRevenue: totalRevenue,
      };
    },
  });

  const grantAccessMutation = useMutation({
    mutationFn: async (data: { email: string; paymentType: string; days: number }) => {
      // First find the user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email)
        .single();

      if (profileError || !profile) {
        throw new Error("User not found with that email");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.days);

      const { error } = await supabase.from("users_payments").insert({
        user_id: profile.id,
        payment_type: "one_time",
        subscription_plan: data.paymentType,
        amount: data.paymentType === "weekly" ? 19 : 59,
        currency: "ZAR",
        status: "successful",
        description: `Admin grant for ${data.paymentType} access`,
        transaction_reference: `ADMIN-GRANT-${Date.now()}`,
        payment_method: "admin_grant",
        metadata: {
          duration_days: data.days,
          admin_granted: true,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access granted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      setGrantDialogOpen(false);
      setGrantForm({ email: "", paymentType: "weekly", days: 7 });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async (data: { id: string; status?: string; access_expires_at?: string }) => {
      const { error } = await supabase
        .from("users_payments")
        .update(data)
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment updated");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      setSelectedPayment(null);
    },
    onError: () => {
      toast.error("Failed to update payment");
    },
  });

  const revokeAccess = (paymentId: string) => {
    updatePaymentMutation.mutate({ id: paymentId, status: "cancelled" });
  };

  const extendAccess = (paymentId: string, days: number) => {
    const payment = payments?.find(p => p.id === paymentId);
    if (!payment) return;

    const currentExpiry = new Date(payment.access_expires_at);
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
    newExpiry.setDate(newExpiry.getDate() + days);

    updatePaymentMutation.mutate({
      id: paymentId,
      access_expires_at: newExpiry.toISOString(),
      status: "active",
    });
  };

  const filteredPayments = payments?.filter(p => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const email = p.profiles?.email?.toLowerCase() || "";
    const name = `${p.profiles?.first_name || ""} ${p.profiles?.last_name || ""}`.toLowerCase();
    return email.includes(search) || name.includes(search) || p.custom_payment_id?.toLowerCase().includes(search);
  });

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === "cancelled") {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (status === "active" && !isExpired) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    if (status === "active" && isExpired) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    if (status === "pending") {
      return <Badge variant="outline">Pending</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Paid Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Users with active access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">From paid access</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Premium Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User Email</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={grantForm.email}
                  onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Access Type</Label>
                <Select
                  value={grantForm.paymentType}
                  onValueChange={(v) => setGrantForm({
                    ...grantForm,
                    paymentType: v as "weekly" | "monthly",
                    days: v === "weekly" ? 7 : 30,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                    <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={grantForm.days}
                  onChange={(e) => setGrantForm({ ...grantForm, days: parseInt(e.target.value) || 7 })}
                />
              </div>
              <Button
                onClick={() => grantAccessMutation.mutate(grantForm)}
                disabled={grantAccessMutation.isPending || !grantForm.email}
                className="w-full"
              >
                {grantAccessMutation.isPending ? "Granting..." : "Grant Access"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : filteredPayments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payment.profiles?.first_name || ""} {payment.profiles?.last_name || ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.profiles?.email || "Unknown"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.payment_type}
                      </Badge>
                    </TableCell>
                    <TableCell>R{(payment.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status, payment.access_expires_at)}
                    </TableCell>
                    <TableCell>
                      {payment.paid_at 
                        ? format(new Date(payment.paid_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.access_expires_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground capitalize">
                        {payment.payment_method?.replace(/_/g, " ") || "BobPay"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => extendAccess(payment.id, 7)}
                          title="Extend 7 days"
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        {payment.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeAccess(payment.id)}
                            title="Revoke access"
                          >
                            <Ban className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
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

export default PaymentsTab;

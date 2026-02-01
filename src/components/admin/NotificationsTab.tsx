import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Send, 
  Users, 
  AlertTriangle,
  Info,
  Megaphone,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

const NotificationsTab = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "normal",
    target_user_id: "",
    expires_at: "",
  });

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (notification: typeof newNotification) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("notifications").insert({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        target_user_id: notification.target_user_id || null,
        expires_at: notification.expires_at || null,
        created_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setIsDialogOpen(false);
      setNewNotification({
        title: "",
        message: "",
        type: "general",
        priority: "normal",
        target_user_id: "",
        expires_at: "",
      });
      toast.success("Notification created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create notification");
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete notification");
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "promotion": return <Megaphone className="w-4 h-4 text-primary" />;
      case "listing": return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications Manager
          </h2>
          <p className="text-muted-foreground text-sm">Create and manage push notifications for users</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Notification message..."
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="listing">Listing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target">Target User ID (optional)</Label>
                  <Input
                    id="target"
                    placeholder="Leave empty for all users"
                    value={newNotification.target_user_id}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, target_user_id: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to send to all users</p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => createMutation.mutate(newNotification)}
                  disabled={!newNotification.title || !newNotification.message || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Notification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : notifications?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No notifications created yet
                  </TableCell>
                </TableRow>
              ) : (
                notifications?.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      {getTypeIcon(notification.type)}
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      {notification.target_user_id ? (
                        <Badge variant="outline" className="text-xs">
                          {notification.target_user_id.slice(0, 8)}...
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          All
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(notification.priority) as any}>
                        {notification.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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

export default NotificationsTab;

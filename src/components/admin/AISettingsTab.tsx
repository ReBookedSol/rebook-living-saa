import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AIRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  request_data: any;
}

const AISettingsTab = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    todayRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    fetchSettings();
    fetchUsageStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('is_enabled')
        .eq('feature_name', 'bursary_pack_generator')
        .single();

      if (error) throw error;
      setIsEnabled(data?.is_enabled ?? true);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const { data: allRequests, error } = await supabase
        .from('ai_pack_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setRequests(allRequests || []);

      // Calculate stats
      const total = allRequests?.length || 0;
      const today = allRequests?.filter(r => {
        const requestDate = new Date(r.created_at);
        const todayDate = new Date();
        return requestDate.toDateString() === todayDate.toDateString();
      }).length || 0;

      const completed = allRequests?.filter(r => r.status === 'completed') || [];
      const successRate = total > 0 ? (completed.length / total) * 100 : 0;

      // Calculate average response time
      const completedWithTime = completed.filter(r => r.completed_at);
      const avgTime = completedWithTime.length > 0
        ? completedWithTime.reduce((acc, r) => {
            const start = new Date(r.created_at).getTime();
            const end = new Date(r.completed_at!).getTime();
            return acc + (end - start);
          }, 0) / completedWithTime.length / 1000 // Convert to seconds
        : 0;

      setStats({
        totalRequests: total,
        todayRequests: today,
        successRate: Math.round(successRate),
        avgResponseTime: Math.round(avgTime),
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({ 
          is_enabled: checked,
          updated_at: new Date().toISOString()
        })
        .eq('feature_name', 'bursary_pack_generator');

      if (error) throw error;

      setIsEnabled(checked);
      toast({
        title: "Success",
        description: `AI feature ${checked ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">AI Pack Generator Settings</h3>
        <p className="text-sm text-muted-foreground">
          Control and monitor the AI bursary pack generation feature
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Control</CardTitle>
          <CardDescription>
            Enable or disable the AI pack generator for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
            <Label htmlFor="ai-toggle">
              {isEnabled ? 'AI Feature Enabled' : 'AI Feature Disabled'}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>
            Last 50 AI pack generation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No requests yet
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const responseTime = request.completed_at
                      ? Math.round((new Date(request.completed_at).getTime() - new Date(request.created_at).getTime()) / 1000)
                      : null;

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {request.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'completed' ? 'default' :
                            request.status === 'processing' ? 'secondary' :
                            'destructive'
                          }>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {responseTime ? `${responseTime}s` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettingsTab;
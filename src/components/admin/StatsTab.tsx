import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, CheckCircle, Users, Mail } from "lucide-react";

const StatsTab = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [accommodations, profiles, messages] = await Promise.all([
        supabase.from("accommodations").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("messages").select("*", { count: "exact" }),
      ]);

      const activeAccommodations = accommodations.data?.filter(a => a.status === "active").length || 0;
      const nsfasAccredited = accommodations.data?.filter(a => a.nsfas_accredited).length || 0;
      const unreadMessages = messages.data?.filter(m => !m.read).length || 0;

      return {
        totalListings: accommodations.count || 0,
        activeListings: activeAccommodations,
        nsfasAccredited,
        totalProfiles: profiles.count || 0,
        totalMessages: messages.count || 0,
        unreadMessages,
      };
    },
  });

  const statCards = [
    { title: "Total Listings", value: stats?.totalListings || 0, icon: Home, color: "text-primary" },
    { title: "Active Listings", value: stats?.activeListings || 0, icon: Home, color: "text-green-600" },
    { title: "NSFAS Accredited", value: stats?.nsfasAccredited || 0, icon: CheckCircle, color: "text-accent" },
    { title: "Total Profiles", value: stats?.totalProfiles || 0, icon: Users, color: "text-blue-600" },
    { title: "Total Messages", value: stats?.totalMessages || 0, icon: Mail, color: "text-purple-600" },
    { title: "Unread Messages", value: stats?.unreadMessages || 0, icon: Mail, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsTab;

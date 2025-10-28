import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import AccommodationsTab from "@/components/admin/AccommodationsTab";
import ProfilesTab from "@/components/admin/ProfilesTab";
import MessagesTab from "@/components/admin/MessagesTab";
import StatsTab from "@/components/admin/StatsTab";
import ReportsTab from "@/components/admin/ReportsTab";
import AddAccommodationTab from "@/components/admin/AddAccommodationTab";

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Panel 2025-05-19</h1>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
            <TabsTrigger value="add">Add</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>

          <TabsContent value="accommodations">
            <AccommodationsTab />
          </TabsContent>

          <TabsContent value="add">
            <AddAccommodationTab />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="profiles">
            <ProfilesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;

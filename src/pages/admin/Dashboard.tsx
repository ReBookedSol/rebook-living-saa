import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import AccommodationsTab from "@/components/admin/AccommodationsTab";
import ProfilesTab from "@/components/admin/ProfilesTab";
import MessagesTab from "@/components/admin/MessagesTab";
import StatsTab from "@/components/admin/StatsTab";
import ReportsTab from "@/components/admin/ReportsTab";
import AddAccommodationTab from "@/components/admin/AddAccommodationTab";

const Dashboard = () => {
  const { toast } = useToast();

  const csvPrompt = `Please read the following PDF and extract all relevant information to create a text-based CSV in the following format:

property_name,type,address,city,province,monthly_cost,rooms_available,amenities,gender_policy,contact_person,contact_email,contact_phone,university,nsfas_accredited,website,units,description,rating

Guidelines:

For amenities, separate multiple items with a pipe (|) symbol — for example: WiFi|Laundry|Study Room.

Rating should be in decimal format (e.g., 4.5).

nsfas_accredited should be either true or false.

All fields must be completed.

If any information is missing in the PDF, conduct thorough research using credible sources (such as official property websites, university housing pages, or reputable portals like Property24).

The monthly_cost field is the highest priority — make sure every entry includes this value.

If multiple listings share the same address, combine them into a single entry and record the total number of units under the units field. Avoid duplicates of the same accommodation.

Ensure the final CSV is complete, accurate, and properly formatted.`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(csvPrompt);
      toast({
        title: "Copied!",
        description: "CSV extraction prompt copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel 2025-05-19</h1>
          <Button onClick={handleCopyPrompt} variant="outline" size="sm" className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Copy CSV Prompt</span>
            <span className="sm:hidden">CSV Prompt</span>
          </Button>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto p-1">
            <TabsTrigger value="stats" className="text-xs sm:text-sm">Stats</TabsTrigger>
            <TabsTrigger value="accommodations" className="text-xs sm:text-sm">Listings</TabsTrigger>
            <TabsTrigger value="add" className="text-xs sm:text-sm">Add</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">Messages</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs sm:text-sm">Profiles</TabsTrigger>
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

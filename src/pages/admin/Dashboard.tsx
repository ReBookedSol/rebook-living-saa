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
import BursariesTab from "@/components/admin/BursariesTab";
import AISettingsTab from "@/components/admin/AISettingsTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import UniversityMergeTab from "@/components/admin/UniversityMergeTab";
import LandlordSubmissionsTab from "@/components/admin/LandlordSubmissionsTab";
import PaymentsTab from "@/components/admin/PaymentsTab";

const Dashboard = () => {
  const { toast } = useToast();

  const jsonPrompt = `Create fully filled JSON records for every accommodation property in the PDF — using both the data in the document and additional verified online research (from official or credible public sources).

🧩 JSON OUTPUT FORMAT
For each accommodation, output an object in this format:

{
  "property_name": "",
  "type": "",
  "address": "",
  "city": "",
  "province": "",
  "monthly_cost": 0,
  "rooms_available": 0,
  "amenities": [],
  "gender_policy": "",
  "contact_person": "",
  "contact_email": "",
  "contact_phone": "",
  "university": "",
  "nsfas_accredited": false,
  "website": "",
  "units": 0,
  "description": "",
  "rating": 0.0
}

The final output must be a valid JSON array ([ ... ]) containing all entries in the PDF.

⚙️ RULES & REQUIREMENTS
1. Extract all available details from the PDF, such as property name, contact info, address, and capacity.
2. Research missing details using credible public sources:
   * Official accommodation websites
   * University housing portals (UP, Wits, UJ, VUT, etc.)
   * Property24, Respublica, Campus Africa, Urban Circle, South Point, StudentDigz, etc.
   * Google Maps, Google Business listings, or student accommodation portals.
3. Monthly cost:
   * Must always be filled.
   * If not in the PDF, find “from” or “average” rental rates online.
4. Amenities:
   * Must come from real information found online — do not guess or make them up.
   * Include everything listed publicly (WiFi, Study Area, Gym, Shuttle, Security, Kitchen, Laundry, Parking, etc.).
   * Output as an array, for example:

"amenities": ["WiFi", "Laundry", "24/7 Security", "Study Area"]

5. Gender policy:
   * Determine from official info or website photos — if not stated, use "Co-ed".
6. nsfas_accredited:
   * true only if confirmed NSFAS-accredited or on the official university list.
   * Otherwise false.
7. rating:
   * Use actual Google rating if available.
   * Otherwise use nearby property averages (3.0–5.0 scale).
8. website:
   * Use the property’s or management company’s verified website.
9. description:
   * Write one short factual summary (1–2 sentences) using verified information.
10. Combine duplicates — if multiple listings share the same address, merge them and update the units count.
11. No fields should be empty. If something can’t be found after searching, use the most reasonable verified alternative.
12. Output clean JSON only — no commentary, no explanations, no notes.

Example Output:

[
  {
    "property_name": "Campus Central Student Accommodation",
    "type": "Purpose-Built Student Accommodation",
    "address": "115 Duxbury Road, Hillcrest",
    "city": "Pretoria",
    "province": "Gauteng",
    "monthly_cost": 5500,
    "rooms_available": 2,
    "amenities": ["WiFi", "Laundry", "Study Area", "24/7 Security", "Kitchen"],
    "gender_policy": "Co-ed",
    "contact_person": "Margie Naidoo",
    "contact_email": "margie@renprop.co.za",
    "contact_phone": "0114636161",
    "university": "University of Pretoria",
    "nsfas_accredited": true,
    "website": "https://www.campuscentral.co.za",
    "units": 200,
    "description": "NSFAS-accredited student apartments near UP with furnished rooms, study spaces, and laundry facilities.",
    "rating": 4.6
  }
]

`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(jsonPrompt);
      toast({
        title: "Copied!",
        description: "JSON extraction prompt copied to clipboard",
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
            <span className="hidden sm:inline">Copy JSON Prompt</span>
            <span className="sm:hidden">JSON Prompt</span>
          </Button>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-12 gap-1 h-auto p-1">
            <TabsTrigger value="stats" className="text-xs sm:text-sm">Stats</TabsTrigger>
            <TabsTrigger value="accommodations" className="text-xs sm:text-sm">Listings</TabsTrigger>
            <TabsTrigger value="landlords" className="text-xs sm:text-sm">Landlords</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="add" className="text-xs sm:text-sm">Add</TabsTrigger>
            <TabsTrigger value="university" className="text-xs sm:text-sm">Universities</TabsTrigger>
            <TabsTrigger value="bursaries" className="text-xs sm:text-sm">Bursaries</TabsTrigger>
            <TabsTrigger value="ai-settings" className="text-xs sm:text-sm">AI Settings</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">Messages</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs sm:text-sm">Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>

          <TabsContent value="accommodations">
            <AccommodationsTab />
          </TabsContent>

          <TabsContent value="landlords">
            <LandlordSubmissionsTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="add">
            <AddAccommodationTab />
          </TabsContent>

          <TabsContent value="university">
            <UniversityMergeTab />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>

          <TabsContent value="profiles">
            <ProfilesTab />
          </TabsContent>

          <TabsContent value="bursaries">
            <BursariesTab />
          </TabsContent>

          <TabsContent value="ai-settings">
            <AISettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;

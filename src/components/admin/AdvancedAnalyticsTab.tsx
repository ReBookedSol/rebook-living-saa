 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
 import { TrendingUp, Search, Phone, Mail, GraduationCap, MapPin, Filter, Users, Building2 } from "lucide-react";
 
 const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];
 
 const AdvancedAnalyticsTab = () => {
   // Search analytics
   const { data: searchStats } = useQuery({
     queryKey: ["admin-search-analytics"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("search_analytics")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(1000);
 
       if (error) throw error;
 
       // Aggregate data
       const universitySearches: Record<string, number> = {};
       const locationSearches: Record<string, number> = {};
       const priceRanges: Record<string, number> = {};
       let nsfasFilterCount = 0;
       let genderFilterCount = 0;
       let amenitiesFilterCount = 0;
       let priceFilterCount = 0;
 
       data?.forEach((s) => {
         if (s.university_searched) {
           universitySearches[s.university_searched] = (universitySearches[s.university_searched] || 0) + 1;
         }
         if (s.location_searched || s.city_searched) {
           const loc = s.location_searched || s.city_searched || "Unknown";
           locationSearches[loc] = (locationSearches[loc] || 0) + 1;
         }
         if (s.max_price) {
           const range = s.max_price <= 2000 ? "R0-R2000" :
                        s.max_price <= 4000 ? "R2001-R4000" :
                        s.max_price <= 6000 ? "R4001-R6000" :
                        s.max_price <= 8000 ? "R6001-R8000" : "R8000+";
           priceRanges[range] = (priceRanges[range] || 0) + 1;
         }
         if (s.used_nsfas_filter) nsfasFilterCount++;
         if (s.used_gender_filter) genderFilterCount++;
         if (s.used_amenities_filter) amenitiesFilterCount++;
         if (s.used_price_filter) priceFilterCount++;
       });
 
       return {
         totalSearches: data?.length || 0,
         topUniversities: Object.entries(universitySearches)
           .sort((a, b) => b[1] - a[1])
           .slice(0, 10)
           .map(([name, count]) => ({ name, count })),
         topLocations: Object.entries(locationSearches)
           .sort((a, b) => b[1] - a[1])
           .slice(0, 10)
           .map(([name, count]) => ({ name, count })),
         priceRanges: Object.entries(priceRanges)
           .map(([range, count]) => ({ range, count })),
         filterUsage: [
           { name: "NSFAS Filter", count: nsfasFilterCount },
           { name: "Price Filter", count: priceFilterCount },
           { name: "Amenities Filter", count: amenitiesFilterCount },
           { name: "Gender Filter", count: genderFilterCount },
         ],
       };
     },
   });
 
   // Contact/lead analytics
   const { data: contactStats } = useQuery({
     queryKey: ["admin-contact-analytics"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("contact_analytics")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(1000);
 
       if (error) throw error;
 
       const contactByType: Record<string, number> = {};
       const contactByUniversity: Record<string, number> = {};
       const dailyContacts: Record<string, number> = {};
 
       data?.forEach((c) => {
         contactByType[c.contact_type] = (contactByType[c.contact_type] || 0) + 1;
         if (c.university) {
           contactByUniversity[c.university] = (contactByUniversity[c.university] || 0) + 1;
         }
         const date = new Date(c.created_at).toISOString().split("T")[0];
         dailyContacts[date] = (dailyContacts[date] || 0) + 1;
       });
 
       return {
         totalContacts: data?.length || 0,
         byType: Object.entries(contactByType).map(([type, count]) => ({ type, count })),
         byUniversity: Object.entries(contactByUniversity)
           .sort((a, b) => b[1] - a[1])
           .slice(0, 10)
           .map(([name, count]) => ({ name, count })),
         dailyTrend: Object.entries(dailyContacts)
           .sort((a, b) => a[0].localeCompare(b[0]))
           .slice(-30)
           .map(([date, count]) => ({ date, count })),
       };
     },
   });
 
   // University demand map
   const { data: universityDemand } = useQuery({
     queryKey: ["admin-university-demand"],
     queryFn: async () => {
       // Get views per university from activity_logs
       const { data: activityData } = await supabase
         .from("activity_logs")
         .select("accommodation_id, accommodations!inner(university)")
         .eq("event_type", "page_view")
         .not("accommodation_id", "is", null);
 
       // Get listings count per university
       const { data: listingsData } = await supabase
         .from("accommodations")
         .select("university");
 
       // Get contacts per university from contact_analytics
       const { data: contactData } = await supabase
         .from("contact_analytics")
         .select("university");
 
       const viewsByUni: Record<string, number> = {};
       const listingsByUni: Record<string, number> = {};
       const contactsByUni: Record<string, number> = {};
 
       activityData?.forEach((a: any) => {
         const uni = a.accommodations?.university;
         if (uni) {
           viewsByUni[uni] = (viewsByUni[uni] || 0) + 1;
         }
       });
 
       listingsData?.forEach((l) => {
         if (l.university) {
           listingsByUni[l.university] = (listingsByUni[l.university] || 0) + 1;
         }
       });
 
       contactData?.forEach((c) => {
         if (c.university) {
           contactsByUni[c.university] = (contactsByUni[c.university] || 0) + 1;
         }
       });
 
       const allUnis = new Set([
         ...Object.keys(viewsByUni),
         ...Object.keys(listingsByUni),
         ...Object.keys(contactsByUni),
       ]);
 
       return Array.from(allUnis).map((uni) => ({
         university: uni,
         views: viewsByUni[uni] || 0,
         listings: listingsByUni[uni] || 0,
         contacts: contactsByUni[uni] || 0,
         demandScore: (viewsByUni[uni] || 0) / Math.max(listingsByUni[uni] || 1, 1),
       }))
         .sort((a, b) => b.demandScore - a.demandScore)
         .slice(0, 15);
     },
   });
 
   // Price insights
   const { data: priceInsights } = useQuery({
     queryKey: ["admin-price-insights"],
     queryFn: async () => {
       // Get all viewed listings with prices
       const { data: viewedData } = await supabase
         .from("activity_logs")
         .select("accommodation_id, accommodations!inner(monthly_cost, property_name)")
         .eq("event_type", "page_view")
         .not("accommodation_id", "is", null);
 
       // Get contacted listings with prices
       const { data: contactedData } = await supabase
         .from("contact_analytics")
         .select("accommodation_id, monthly_cost");
 
       let totalViewedPrice = 0;
       let viewedCount = 0;
       let totalContactedPrice = 0;
       let contactedCount = 0;
 
       viewedData?.forEach((v: any) => {
         if (v.accommodations?.monthly_cost) {
           totalViewedPrice += v.accommodations.monthly_cost;
           viewedCount++;
         }
       });
 
       contactedData?.forEach((c) => {
         if (c.monthly_cost) {
           totalContactedPrice += c.monthly_cost;
           contactedCount++;
         }
       });
 
       return {
         avgViewedPrice: viewedCount > 0 ? Math.round(totalViewedPrice / viewedCount) : 0,
         avgContactedPrice: contactedCount > 0 ? Math.round(totalContactedPrice / contactedCount) : 0,
         totalViewed: viewedCount,
         totalContacted: contactedCount,
       };
     },
   });
 
   // User behaviour - conversion rates
   const { data: conversionStats } = useQuery({
     queryKey: ["admin-conversion-stats"],
     queryFn: async () => {
       const { count: totalSearches } = await supabase
         .from("search_analytics")
         .select("*", { count: "exact", head: true });
 
       const { count: totalViews } = await supabase
         .from("activity_logs")
         .select("*", { count: "exact", head: true })
         .eq("event_type", "page_view")
         .not("accommodation_id", "is", null);
 
       const { count: totalContacts } = await supabase
         .from("contact_analytics")
         .select("*", { count: "exact", head: true });
 
       return {
         totalSearches: totalSearches || 0,
         totalViews: totalViews || 0,
         totalContacts: totalContacts || 0,
         searchToViewRate: totalSearches && totalViews ? ((totalViews / totalSearches) * 100).toFixed(1) : "0",
         viewToContactRate: totalViews && totalContacts ? ((totalContacts / totalViews) * 100).toFixed(1) : "0",
       };
     },
   });
 
   return (
     <div className="space-y-6">
       {/* Conversion Funnel */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary" />
             User Behaviour Funnel
           </CardTitle>
           <CardDescription>Search → View → Contact conversion rates</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div className="text-center p-4 bg-muted/50 rounded-lg">
               <Search className="h-6 w-6 mx-auto mb-2 text-primary" />
               <p className="text-2xl font-bold">{conversionStats?.totalSearches || 0}</p>
               <p className="text-sm text-muted-foreground">Total Searches</p>
             </div>
             <div className="text-center p-4">
               <p className="text-xl font-semibold text-green-600">{conversionStats?.searchToViewRate}%</p>
               <p className="text-xs text-muted-foreground">Search → View</p>
             </div>
             <div className="text-center p-4 bg-muted/50 rounded-lg">
               <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
               <p className="text-2xl font-bold">{conversionStats?.totalViews || 0}</p>
               <p className="text-sm text-muted-foreground">Listing Views</p>
             </div>
             <div className="text-center p-4">
               <p className="text-xl font-semibold text-green-600">{conversionStats?.viewToContactRate}%</p>
               <p className="text-xs text-muted-foreground">View → Contact</p>
             </div>
             <div className="text-center p-4 bg-muted/50 rounded-lg">
               <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
               <p className="text-2xl font-bold">{conversionStats?.totalContacts || 0}</p>
               <p className="text-sm text-muted-foreground">Total Leads</p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       <Tabs defaultValue="search" className="space-y-4">
         <TabsList className="grid grid-cols-4 w-full max-w-2xl">
           <TabsTrigger value="search">Search & Demand</TabsTrigger>
           <TabsTrigger value="leads">Leads</TabsTrigger>
           <TabsTrigger value="university">Universities</TabsTrigger>
           <TabsTrigger value="price">Price Insights</TabsTrigger>
         </TabsList>
 
         {/* Search Analytics */}
         <TabsContent value="search" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Top Searched Universities */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm flex items-center gap-2">
                   <GraduationCap className="h-4 w-4" />
                   Top Searched Universities
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={searchStats?.topUniversities || []} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                       <Tooltip />
                       <Bar dataKey="count" fill="#8884d8" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Top Searched Locations */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm flex items-center gap-2">
                   <MapPin className="h-4 w-4" />
                   Top Searched Locations
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={searchStats?.topLocations || []} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                       <Tooltip />
                       <Bar dataKey="count" fill="#82ca9d" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Price Ranges Searched */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm">Price Ranges Searched</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={searchStats?.priceRanges || []}
                         dataKey="count"
                         nameKey="range"
                         cx="50%"
                         cy="50%"
                         outerRadius={80}
                         label
                       >
                         {searchStats?.priceRanges?.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Filter Usage */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm flex items-center gap-2">
                   <Filter className="h-4 w-4" />
                   Filter Usage
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   {searchStats?.filterUsage?.map((filter) => (
                     <div key={filter.name} className="flex items-center justify-between">
                       <span className="text-sm">{filter.name}</span>
                       <Badge variant="secondary">{filter.count} uses</Badge>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Lead Analytics */}
         <TabsContent value="leads" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Contact Types */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm">Leads by Contact Type</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-4">
                   {contactStats?.byType?.map((t) => (
                     <div key={t.type} className="text-center p-4 bg-muted/50 rounded-lg">
                       {t.type === "phone" && <Phone className="h-6 w-6 mx-auto mb-2 text-green-500" />}
                       {t.type === "email" && <Mail className="h-6 w-6 mx-auto mb-2 text-blue-500" />}
                       {t.type === "whatsapp" && <Phone className="h-6 w-6 mx-auto mb-2 text-green-600" />}
                       {t.type === "website" && <Building2 className="h-6 w-6 mx-auto mb-2 text-purple-500" />}
                       <p className="text-2xl font-bold">{t.count}</p>
                       <p className="text-sm text-muted-foreground capitalize">{t.type}</p>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
 
             {/* Daily Leads Trend */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm">Daily Leads (Last 30 Days)</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={contactStats?.dailyTrend || []}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                       <YAxis />
                       <Tooltip />
                       <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
 
             {/* Leads by University */}
             <Card className="md:col-span-2">
               <CardHeader>
                 <CardTitle className="text-sm">Top Universities by Leads Generated</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={contactStats?.byUniversity || []}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                       <YAxis />
                       <Tooltip />
                       <Bar dataKey="count" fill="#82ca9d" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* University Demand */}
         <TabsContent value="university" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="text-sm">University Demand Map</CardTitle>
               <CardDescription>
                 High demand score + low supply = landlord opportunity
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>University</TableHead>
                     <TableHead className="text-right">Views</TableHead>
                     <TableHead className="text-right">Contacts</TableHead>
                     <TableHead className="text-right">Listings</TableHead>
                     <TableHead className="text-right">Demand Score</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {universityDemand?.map((uni) => (
                     <TableRow key={uni.university}>
                       <TableCell className="font-medium">{uni.university}</TableCell>
                       <TableCell className="text-right">{uni.views}</TableCell>
                       <TableCell className="text-right">{uni.contacts}</TableCell>
                       <TableCell className="text-right">{uni.listings}</TableCell>
                       <TableCell className="text-right">
                         <Badge variant={uni.demandScore > 10 ? "destructive" : uni.demandScore > 5 ? "default" : "secondary"}>
                           {uni.demandScore.toFixed(1)}
                         </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Price Insights */}
         <TabsContent value="price" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
               <CardContent className="pt-6 text-center">
                 <p className="text-3xl font-bold text-primary">R{priceInsights?.avgViewedPrice?.toLocaleString() || 0}</p>
                 <p className="text-sm text-muted-foreground">Avg. Price Viewed</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="pt-6 text-center">
                 <p className="text-3xl font-bold text-green-600">R{priceInsights?.avgContactedPrice?.toLocaleString() || 0}</p>
                 <p className="text-sm text-muted-foreground">Avg. Price Contacted</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="pt-6 text-center">
                 <p className="text-3xl font-bold">{priceInsights?.totalViewed || 0}</p>
                 <p className="text-sm text-muted-foreground">Total Views</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="pt-6 text-center">
                 <p className="text-3xl font-bold">{priceInsights?.totalContacted || 0}</p>
                 <p className="text-sm text-muted-foreground">Total Contacts</p>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 };
 
 export default AdvancedAnalyticsTab;
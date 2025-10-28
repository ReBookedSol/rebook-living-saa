import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Home, Users, Wifi, Phone, Mail, CheckCircle, ArrowLeft, Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ListingDetail = () => {
  const { id } = useParams();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({ 
    reporter_name: "", 
    reporter_email: "", 
    reason: "", 
    details: "" 
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("messages").insert({
        name: contactForm.name,
        email: contactForm.email,
        subject: `Inquiry about ${listing?.property_name}`,
        message: `${contactForm.message}\n\nProperty: ${listing?.property_name} (${id})`,
      });

      if (error) throw error;

      toast.success("Message sent! The landlord will contact you soon.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const { error } = await supabase.from("reports").insert({
        accommodation_id: id,
        ...reportData,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Thank you for helping us maintain quality.");
      setReportForm({ reporter_name: "", reporter_email: "", reason: "", details: "" });
      setReportDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to submit report. Please try again.");
    },
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.reason) {
      toast.error("Please select a reason for reporting");
      return;
    }
    reportMutation.mutate(reportForm);
  };


  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg mb-8"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/browse">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>

        {/* Header band (multicolor) */}
        <div className="mb-6 relative">
          <div className="rounded-lg flex flex-col md:flex-row items-start md:items-center gap-3 p-4" style={{ background: 'hsl(var(--primary))' }}>
            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center mr-0 md:mr-3 flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
              </svg>
            </div>
            <div className="text-white flex-1 min-w-0">
              <h2 className="font-semibold text-lg md:text-xl truncate">{listing.property_name}</h2>
              <p className="text-sm text-white/90 truncate">{listing.type} • {listing.city}</p>
            </div>
            <div className="flex items-center gap-2">
              {listing.nsfas_accredited && (
                <Badge className="bg-accent text-accent-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  NSFAS Accredited
                </Badge>
              )}
              <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Listing</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for reporting *</Label>
                      <Select
                        value={reportForm.reason}
                        onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inaccurate Information">Inaccurate Information</SelectItem>
                          <SelectItem value="Scam or Fraud">Scam or Fraud</SelectItem>
                          <SelectItem value="Property No Longer Available">Property No Longer Available</SelectItem>
                          <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="report-details">Details</Label>
                      <Textarea
                        id="report-details"
                        value={reportForm.details}
                        onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                        placeholder="Please provide more information about this report..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reporter-name">Your Name (optional)</Label>
                      <Input
                        id="reporter-name"
                        value={reportForm.reporter_name}
                        onChange={(e) => setReportForm({ ...reportForm, reporter_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reporter-email">Your Email (optional)</Label>
                      <Input
                        id="reporter-email"
                        type="email"
                        value={reportForm.reporter_email}
                        onChange={(e) => setReportForm({ ...reportForm, reporter_email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <Button type="submit" disabled={reportMutation.isPending}>
                      {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{listing.property_name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{listing.address}, {listing.city}, {listing.province}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-accent/10 px-3 py-2 rounded-lg">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="font-bold text-sm">{(listing.rating || 0).toFixed(1)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{listing.type}</Badge>
                <Badge variant="secondary">{listing.gender_policy}</Badge>
                {listing.rooms_available && (
                  <Badge variant="secondary">{listing.rooms_available} rooms available</Badge>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">University</h3>
                  <p>{listing.university}</p>
                </div>

                {listing.units && (
                  <div>
                    <h3 className="font-semibold mb-2">Units</h3>
                    <p>{listing.units} units available</p>
                  </div>
                )}
                
                {listing.amenities && listing.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity: string) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.certified_universities && listing.certified_universities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Certified Universities</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {listing.certified_universities.map((uni: string) => (
                        <li key={uni}>{uni}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-primary">R{listing.monthly_cost?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{listing.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="truncate">{listing.contact_email}</span>
                  </div>
                  {listing.contact_person && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{listing.contact_person}</span>
                    </div>
                  )}
                </div>

                <a href={`tel:${listing.contact_phone}`}>
                  <Button className="w-full mb-2 bg-primary hover:bg-primary-hover">
                    Call Now
                  </Button>
                </a>
                <a href={`mailto:${listing.contact_email}`}>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Maps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Map placeholder</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Reviews placeholder</div>
                <p className="mt-3 text-xs text-muted-foreground">Reviews are aggregated from Google Reviews. When connected, ratings and excerpts will appear here.</p>
              </CardContent>
            </Card>

            {listing.website && (
              <Card>
                <CardHeader>
                  <CardTitle>Website</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={listing.website} target="_blank" rel="noreferrer" className="text-primary underline">{listing.website}</a>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;

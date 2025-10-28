import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Star, Home, Users, Wifi, Phone, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ListingDetail = () => {
  const { id } = useParams();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <div className="h-20 rounded-lg flex items-center px-4" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--muted)))' }}>
            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
              </svg>
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-xl">{listing.property_name}</h2>
              <p className="text-sm text-white/90">{listing.type} • {listing.city}</p>
            </div>
            {listing.nsfas_accredited && (
              <Badge className="ml-auto bg-accent text-accent-foreground">
                <CheckCircle className="w-3 h-3 mr-1" />
                NSFAS Accredited
              </Badge>
            )}

            {/* Prev / Next arrows */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {/* placeholder for prev link; replaced below by conditional rendering */}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {/* placeholder for next link */}
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
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-bold text-lg">{listing.rating?.toFixed(1)}</span>
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
                <div>
                  <h3 className="font-semibold mb-2">University</h3>
                  <p>{listing.university}</p>
                </div>
                
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
                <CardTitle>Send Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="I'm interested in this property..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;

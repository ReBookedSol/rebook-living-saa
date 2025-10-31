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
import { useState, useEffect, useRef } from "react";
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

  const mapRef = useRef<HTMLDivElement | null>(null);
  const largeMapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [expandOpen, setExpandOpen] = useState(false);
  const [reviews, setReviews] = useState<any[] | null>(null);

  useEffect(() => {
    const apiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API;
    if (!apiKey) return;

    const existing = document.getElementById('google-maps-script');
    if (existing) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    script.onerror = () => console.warn('Failed to load Google Maps script');
    document.head.appendChild(script);

    function initMap() {
      try {
        const google = (window as any).google;
        if (!google || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -33.9249, lng: 18.4241 },
          zoom: 15,
          mapTypeId: mapType,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: ['roadmap', 'satellite', 'hybrid'],
          },
        });

        mapInstanceRef.current = map;

        const service = new google.maps.places.PlacesService(map);
        const addressQuery = [listing?.property_name, listing?.address, listing?.city, listing?.province].filter(Boolean).join(', ');

        service.findPlaceFromQuery({
          query: addressQuery || listing?.property_name || listing?.address || listing?.city,
          fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        }, (results: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            const place = results[0];
            if (place.geometry && place.geometry.location) {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
              markerRef.current = new google.maps.Marker({ map, position: place.geometry.location, title: place.name });
            }

            service.getDetails({ placeId: place.place_id, fields: ['reviews', 'rating', 'name'] }, (detail: any, dStatus: any) => {
              if (dStatus === google.maps.places.PlacesServiceStatus.OK && detail && detail.reviews) {
                setReviews(detail.reviews.slice(0, 5));
              }
            });
          }
        });
      } catch (err) {
        console.warn('Google Maps init error', err);
      }
    }

    // cleanup not strictly necessary
    return () => {};
  }, [listing]);

  // Sync map type when changed
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Initialize large map when expand dialog opens
  useEffect(() => {
    if (!expandOpen) return;
    const google = (window as any).google;
    if (!google || !largeMapRef.current || !mapInstanceRef.current) return;

    const center = mapInstanceRef.current.getCenter ? mapInstanceRef.current.getCenter() : null;
    const zoom = Math.max(mapInstanceRef.current.getZoom ? mapInstanceRef.current.getZoom() : 15, 16);

    const largeMap = new google.maps.Map(largeMapRef.current, {
      center: center || { lat: -33.9249, lng: 18.4241 },
      zoom,
      mapTypeId: mapType,
      mapTypeControl: true,
      streetViewControl: true,
    });

    if (markerRef.current && markerRef.current.getPosition) {
      new google.maps.Marker({ map: largeMap, position: markerRef.current.getPosition(), title: markerRef.current.getTitle ? markerRef.current.getTitle() : undefined });
    }

    // No cleanup necessary — Google handles DOM, but remove listeners if added in future
  }, [expandOpen]);

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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}>
                      {mapType === 'roadmap' ? 'Satellite' : 'Map'}
                    </Button>
                  </div>
                  <div>
                    <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">Expand Map</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] p-0">
                        <div className="p-4">
                          <DialogHeader>
                            <DialogTitle>Map - {listing.property_name}</DialogTitle>
                          </DialogHeader>
                          <div ref={largeMapRef} className="h-[60vh] w-full rounded-md overflow-hidden bg-muted mt-4" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div ref={mapRef} id="gmaps" className="h-40 w-full rounded-md overflow-hidden bg-muted" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((r: any, idx: number) => (
                      <div key={idx} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{r.author_name}</div>
                          <div className="text-sm text-muted-foreground">{r.rating} ★</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{r.relative_time_description}</div>
                        <p className="mt-2 text-sm">{r.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No reviews available</div>
                )}
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

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "react-router-dom";
import Ad from "@/components/Ad";
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
import { MapPin, Star, Phone, Mail, CheckCircle, ArrowLeft, Flag, Heart, Share, Building2, Lock, Image, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { triggerWebhook } from "@/lib/webhook";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { useAccessControl, FREE_TIER_LIMITS } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";

const ListingDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnPath = params.get('return') || '/browse';
  
  // Access control
  const { accessLevel, hasActivePayment, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({
    reporter_name: "",
    reporter_email: "",
    reason: "",
    details: ""
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;
        const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId).eq("accommodation_id", id).single();
        if (!mounted) return;
        if (!error && data) setIsSaved(true);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const toggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      window.location.href = '/auth';
      return;
    }

    setSavingFavorite(true);
    try {
      if (!isSaved) {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, accommodation_id: id });
        if (error) throw error;
        setIsSaved(true);
        toast.success('Saved to your favorites');
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('accommodation_id', id);
        if (error) throw error;
        setIsSaved(false);
        toast.success('Removed from favorites');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update favorites');
    } finally {
      setSavingFavorite(false);
    }
  };

  const shareListing = async () => {
    const url = `${window.location.origin}/listing/${id}`;
    const title = listing?.property_name || 'Listing';
    const text = listing?.description ? listing.description.slice(0, 140) : `${listing?.property_name || ''} - check this listing`;

    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        toast.success('Share dialog opened');
        return;
      } catch (err: any) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            toast.success('Listing link copied to clipboard');
            return;
          }
        } catch (e) {
          // ignore
        }
        // eslint-disable-next-line no-alert
        prompt('Copy link', url);
        return;
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Listing link copied to clipboard');
        return;
      } catch (e) {
        // ignore
      }
    }

    // eslint-disable-next-line no-alert
    prompt('Copy link', url);
  };

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

  useEffect(() => {
    if (!id || !listing) return;
    
    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
          .from("viewed_accommodations")
          .select("id")
          .eq("user_id", userId)
          .eq("accommodation_id", id)
          .gte("viewed_at", oneDayAgo)
          .single();

        if (existing) return;

        await supabase.from("viewed_accommodations").insert({
          user_id: userId,
          accommodation_id: id,
        });
      } catch (err) {
        console.debug("Failed to track view:", err);
      }
    };

    trackView();
  }, [id, listing]);

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

      await triggerWebhook("contact_message", {
        name: contactForm.name,
        email: contactForm.email,
        subject: `Inquiry about ${listing?.property_name}`,
        message: `${contactForm.message}\n\nProperty: ${listing?.property_name} (${id})`,
        accommodation_id: id,
      });

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
      return reportData;
    },
    onSuccess: async (reportData) => {
      await triggerWebhook("report", reportData);
      toast.success("Report submitted successfully. Thank you for helping us maintain quality.");
      setReportForm({ reporter_name: "", reporter_email: "", reason: "", details: "" });
      setReportDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to submit report. Please try again.");
    },
  });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const passedImages = (location.state as any)?.images as string[] | undefined;

  const [allReviews, setAllReviews] = useState<any[] | null>(null);
  const [allPhotos, setAllPhotos] = useState<string[] | null>(passedImages && passedImages.length > 0 ? passedImages : null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  const photos = isPaidUser ? allPhotos : allPhotos?.slice(0, FREE_TIER_LIMITS.MAX_PHOTOS);
  const reviews = isPaidUser ? allReviews : allReviews?.slice(0, FREE_TIER_LIMITS.MAX_REVIEWS);
  const totalPhotos = allPhotos?.length || 0;
  const totalReviews = allReviews?.length || 0;
  const hasMorePhotos = !isPaidUser && totalPhotos > FREE_TIER_LIMITS.MAX_PHOTOS;
  const hasMoreReviews = !isPaidUser && totalReviews > FREE_TIER_LIMITS.MAX_REVIEWS;

  useEffect(() => {
    if (!isPaidUser) return;
    
    const apiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API;
    if (!apiKey) return;

    const existing = document.getElementById('google-maps-script');
    if (existing) {
      if ((window as any).google) {
        initMap();
      } else {
        existing.addEventListener('load', initMap as any, { once: true } as any);
      }
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
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: ['roadmap', 'satellite'],
          },
          streetViewControl: true,
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

            service.getDetails({ placeId: place.place_id, fields: ['reviews', 'rating', 'name', 'photos', 'url'] }, (detail: any, dStatus: any) => {
              if (dStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                if (detail.reviews) setAllReviews(detail.reviews.slice(0, 10));
                if (detail.photos && detail.photos.length > 0) {
                  try {
                    const urls = detail.photos.map((p: any) => p.getUrl({ maxWidth: 800 }));
                    setAllPhotos(urls);
                  } catch (err) {
                    console.warn('Failed to extract photo urls', err);
                  }
                }
              }
            });
          }
        });
      } catch (err) {
        console.warn('Google Maps init error', err);
      }
    }

    return () => {};
  }, [listing, isPaidUser]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  const enterStreetView = () => {
    try {
      const google = (window as any).google;
      if (!google || !mapInstanceRef.current) return;

      const svService = new google.maps.StreetViewService();
      const svPanorama = mapInstanceRef.current.getStreetView();
      const position = markerRef.current && markerRef.current.getPosition ? markerRef.current.getPosition() : mapInstanceRef.current.getCenter();

      if (!position) {
        toast.error('No location available for Street View');
        return;
      }

      svService.getPanorama({ location: position, radius: 50 }, (data: any, status: any) => {
        if (status === google.maps.StreetViewStatus.OK && data && svPanorama) {
          svPanorama.setPano(data.location.pano);
          svPanorama.setPov({ heading: 270, pitch: 0 });
          svPanorama.setVisible(true);
        } else {
          toast.error('Street View not available at this location');
        }
      });
    } catch (e) {
      console.warn('enterStreetView error', e);
      toast.error('Failed to enter Street View');
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 py-8">
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
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Link to={returnPath}>
            <Button>Back</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link to={returnPath} className="inline-block mb-6">
            <Button variant="ghost" className="gap-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
              Back to browse
            </Button>
          </Link>

          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {listing.is_landlord_listing && (
                      <Badge className="bg-green-500 text-white gap-1.5">
                        <Building2 className="w-3 h-3" />
                        Listed by Landlord
                      </Badge>
                    )}
                    {listing.nsfas_accredited && (
                      <Badge className="bg-blue-500 text-white gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        NSFAS Accredited
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold mb-3 text-foreground">{listing.property_name}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-lg">{listing.address}, {listing.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm">{listing.type}</Badge>
                    <Badge variant="secondary" className="text-sm">{listing.gender_policy}</Badge>
                    {listing.rooms_available && (
                      <Badge variant="secondary" className="text-sm">{listing.rooms_available} rooms available</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="text-center bg-accent/10 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="h-5 w-5 text-accent fill-accent" />
                      <span className="text-2xl font-bold">{(listing.rating || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFavorite}
                      className="rounded-full"
                      disabled={savingFavorite}
                      title={isSaved ? 'Remove favorite' : 'Save favorite'}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareListing}
                      className="rounded-full"
                      title="Share listing"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full" title="Report listing">
                          <Flag className="h-4 w-4" />
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
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photos Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Gallery</CardTitle>
                    </div>
                    {hasMorePhotos && (
                      <Badge variant="secondary" className="text-xs">
                        {FREE_TIER_LIMITS.MAX_PHOTOS} of {totalPhotos}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {photos && photos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {photos.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedPhoto(i); setPhotoDialogOpen(true); }}
                            className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover:shadow-lg transition-all duration-200"
                          >
                            <img loading="lazy" src={src} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          </button>
                        ))}
                      </div>
                      {hasMorePhotos && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                          <UpgradePrompt 
                            type="photos" 
                            totalCount={totalPhotos} 
                            compact 
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No photos available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                  <CardTitle className="text-lg">About this property</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {listing.description && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
                      <p className="text-foreground leading-relaxed">{listing.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">University</h3>
                      <p className="text-foreground font-medium">{listing.university}</p>
                    </div>
                    {listing.units && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Available Units</h3>
                        <p className="text-foreground font-medium">{listing.units} units</p>
                      </div>
                    )}
                  </div>

                  {listing.amenities && listing.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="border-primary/20 bg-primary/5">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.certified_universities && listing.certified_universities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Accredited For</h3>
                      <div className="space-y-1">
                        {listing.certified_universities.map((uni: string) => (
                          <div key={uni} className="flex items-center gap-2 text-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{uni}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.website && (
                    <div className="pt-2 border-t">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Website</h3>
                      <a href={listing.website} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-sm">
                        {listing.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Card */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Location</CardTitle>
                    {!isPaidUser && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isPaidUser ? (
                    <>
                      <div className="flex gap-2 mb-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                        >
                          {mapType === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}
                        </Button>
                        <Button size="sm" onClick={() => enterStreetView()}>
                          Street View
                        </Button>
                      </div>
                      <div ref={mapRef} id="gmaps" className="h-80 w-full rounded-lg overflow-hidden bg-muted" />
                    </>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-muted to-muted-foreground/10 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Unlock map and street view with a premium pass</p>
                        <UpgradePrompt type="map" compact />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ad Card */}
              {!isPaidUser && (
                <div className="my-6">
                  <Ad density="compact" />
                </div>
              )}

              {/* Unified Reviews Section */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                  <CardTitle className="text-lg">Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Review Form */}
                    <div className="pb-6 border-b">
                      <ReviewForm
                        accommodationId={id || ""}
                        onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)}
                      />
                    </div>

                    {/* All Reviews */}
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">All Reviews</h3>
                      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {/* ReBooked Living Reviews */}
                        <ReviewsList
                          accommodationId={id}
                          onReviewsUpdated={() => setReviewsRefreshTrigger(prev => prev + 1)}
                        />

                        {/* Google Reviews */}
                        {reviews && reviews.length > 0 && (
                          <>
                            <div className="my-4 text-center text-xs text-muted-foreground">
                              ─ Google Reviews ─
                            </div>
                            {reviews.map((r: any, idx: number) => (
                              <div key={`google-${idx}`} className="p-3 bg-muted/30 rounded-lg border border-muted">
                                <div className="flex gap-2 items-start mb-2">
                                  {r.profile_photo_url ? (
                                    <img src={r.profile_photo_url} alt={r.author_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 justify-between mb-0.5">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm truncate">{r.author_name}</p>
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Google</span>
                                      </div>
                                      <span className="text-xs text-yellow-500 font-medium">{r.rating}★</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{r.relative_time_description}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-foreground line-clamp-3">{r.text}</p>
                              </div>
                            ))}
                            {hasMoreReviews && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <UpgradePrompt
                                  type="reviews"
                                  totalCount={totalReviews}
                                  compact
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-20">
              {/* Contact Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary mb-1">R{listing.monthly_cost?.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                        <p className="font-medium text-sm break-all">{listing.contact_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                        <p className="font-medium text-sm break-all">{listing.contact_email}</p>
                      </div>
                    </div>
                    {listing.contact_person && (
                      <div className="flex items-start gap-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Contact Person</p>
                        <p className="font-medium text-sm">{listing.contact_person}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <a href={`tel:${listing.contact_phone}`} className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </a>
                    <a href={`mailto:${listing.contact_email}`} className="block">
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* Photo Dialog */}
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent className="max-w-4xl w-[95vw] p-2">
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedPhoto(p => Math.max(0, p - 1))} 
                  disabled={selectedPhoto === 0}
                >
                  ← Prev
                </Button>
                <p className="text-sm font-medium">{selectedPhoto + 1} / {photos?.length || 0}</p>
                <Button 
                  variant="ghost"
                  onClick={() => setSelectedPhoto(p => Math.min((photos?.length || 1) - 1, p + 1))} 
                  disabled={photos && selectedPhoto >= photos.length - 1}
                >
                  Next →
                </Button>
              </div>
              <img loading="lazy" src={photos && photos[selectedPhoto]} alt={`Photo ${selectedPhoto+1}`} className="w-full h-[65vh] object-contain rounded" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ListingDetail;

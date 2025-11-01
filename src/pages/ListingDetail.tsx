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
import { MapPin, Star, Home, Users, Wifi, Phone, Mail, CheckCircle, ArrowLeft, Flag, Heart, Share } from "lucide-react";
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
        // try clipboard fallback
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            toast.success('Listing link copied to clipboard');
            return;
          }
        } catch (e) {
          // ignore
        }
        // final fallback
        // eslint-disable-next-line no-alert
        prompt('Copy link', url);
        return;
      }
    }

    // no native share
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Listing link copied to clipboard');
        return;
      } catch (e) {
        // ignore
      }
    }

    // fallback
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

  // Track viewed accommodation
  useEffect(() => {
    if (!id || !listing) return;
    
    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;

        // Check if already viewed in the last 24 hours to avoid duplicates
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
          .from("viewed_accommodations")
          .select("id")
          .eq("user_id", userId)
          .eq("accommodation_id", id)
          .gte("viewed_at", oneDayAgo)
          .single();

        if (existing) return; // Already tracked recently

        // Insert new view record
        await supabase.from("viewed_accommodations").insert({
          user_id: userId,
          accommodation_id: id,
        });
      } catch (err) {
        // Silently fail - tracking is not critical
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
  const location = useLocation();
  const passedImages = (location.state as any)?.images as string[] | undefined;

  const [reviews, setReviews] = useState<any[] | null>(null);
  const [photos, setPhotos] = useState<string[] | null>(passedImages && passedImages.length > 0 ? passedImages.slice(0,3) : null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [placeUrl, setPlaceUrl] = useState<string | null>(null);
  // Demo state for AI-powered insights CTA (preview only)
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<any | null>(null);
  const streetViewRef = useRef<any | null>(null);
  const [miniMapType, setMiniMapType] = useState<'roadmap'|'satellite'>('satellite');

  useEffect(() => {
    if (!aiDialogOpen) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current = null;
      }
      if (streetViewRef.current) {
        streetViewRef.current = null;
      }
      return;
    }

    const google = (window as any).google;
    if (!google || !miniMapRef.current) return;

    const center = mapInstanceRef.current && typeof mapInstanceRef.current.getCenter === 'function'
      ? mapInstanceRef.current.getCenter()
      : { lat: -33.9249, lng: 18.4241 };

    try {
      const map = new google.maps.Map(miniMapRef.current, { center, zoom: 15, mapTypeId: miniMapType, mapTypeControl: true });
      new google.maps.Marker({ map, position: center });
      miniMapInstanceRef.current = map;
    } catch (e) {
      console.warn('Mini map init failed', e);
    }

    return () => { miniMapInstanceRef.current = null; streetViewRef.current = null; };
  }, [aiDialogOpen, miniMapType]);

  const toggleMiniMapType = () => {
    const next = miniMapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMiniMapType(next);
    if (miniMapInstanceRef.current && miniMapInstanceRef.current.setMapTypeId) {
      miniMapInstanceRef.current.setMapTypeId(next);
    }
  };

  const openMiniStreetView = () => {
    const google = (window as any).google;
    if (!google || !miniMapRef.current || !miniMapInstanceRef.current) return;
    const center = miniMapInstanceRef.current.getCenter ? miniMapInstanceRef.current.getCenter() : { lat: -33.9249, lng: 18.4241 };
    try {
      const panorama = new google.maps.StreetViewPanorama(miniMapRef.current, { position: center, pov: { heading: 0, pitch: 0 }, visible: true });
      miniMapInstanceRef.current.setStreetView(panorama);
      streetViewRef.current = panorama;
    } catch (e) {
      console.warn('Street View init failed', e);
    }
  };

  useEffect(() => {
    const apiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API2;
    const photoApiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API2;
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
          mapTypeControl: false,
          streetViewControl: false,
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

            (async () => {
              try {
                // Simply request place details and use the photos directly; do NOT persist photos or reviews.
                service.getDetails({ placeId: place.place_id, fields: ['reviews', 'rating', 'name', 'photos', 'url'] }, (detail: any, dStatus: any) => {
                  if (dStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                    if (detail.reviews) setReviews(detail.reviews.slice(0, 5));
                    // Only set photos from Google if no images were passed from the listing card
                    if ((!photos || photos.length === 0) && detail.photos && detail.photos.length > 0) {
                      try {
                        const urls = detail.photos.map((p: any) => p.getUrl({ maxWidth: 800 }));
                        setPhotos(urls.slice(0,3));
                      } catch (err) {
                        console.warn('Failed to extract photo urls', err);
                      }
                    }
                    if (detail.url) setPlaceUrl(detail.url);
                  }
                });
              } catch (e) {
                console.warn('place details error', e);
              }
            })();
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
        <div className="max-w-7xl mx-auto px-6 py-8">
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
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
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
      <div className="max-w-7xl mx-auto px-6 py-8">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 ${isSaved ? 'bg-white/10 text-red-500' : 'text-white/90'}`}
              aria-pressed={isSaved}
              title={isSaved ? 'Remove favorite' : 'Save favorite'}
              disabled={savingFavorite}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500' : 'text-white'}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={shareListing}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white/90"
              title="Share listing"
            >
              <Share className="w-4 h-4 text-white" />
            </Button>

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

                {listing.website && (
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a href={listing.website} target="_blank" rel="noreferrer" className="text-primary underline">{listing.website}</a>
                  </div>
                )}

              </CardContent>
            </Card>

            <div className="my-6">
              <Ad />
            </div>

            {/* Demo: AI Photos & Map Insights CTA (placed above Photos & Map) */}
            <div className="my-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-powered Photos & Map Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Want the full picture? 📸 AI summaries, extra photos, nearby hotspots & local air quality — unlock now!</p>
                  <div className="text-center">
                    <Button onClick={() => setAiDialogOpen((v) => !v)} className="w-full bg-primary hover:bg-primary-hover">
                      {aiDialogOpen ? 'Hide AI Insights' : 'See AI Insights — Preview'}
                    </Button>

                    <div className={`overflow-hidden transform origin-top transition-all duration-300 mt-4 ${aiDialogOpen ? 'max-h-[800px] scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="mt-2">AI Summary: Overall positive sentiment. Guests praise friendly staff and location, but some mention occasional noise in the evenings. Top features: fast Wi‑Fi, secure building, close to campus.</p>

                            <h4 className="mt-4 font-semibold">More photos</h4>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {(photos && photos.length > 0 ? photos.slice(0,6) : ['/placeholder.svg','/placeholder.svg','/placeholder.svg']).map((src, i) => (
                                <div key={i} className="w-full h-24 overflow-hidden rounded-md bg-muted">
                                  <img src={src} alt={`AI photo ${i+1}`} className="object-cover w-full h-full" />
                                </div>
                              ))}
                            </div>

                            <h4 className="mt-4 font-semibold">Nearby places</h4>
                            <ul className="mt-2 list-disc ml-5 text-sm">
                              <li>Convenience Store — 120 m</li>
                              <li>Campus Shuttle Stop — 230 m</li>
                              <li>Cafe & Bakery — 300 m</li>
                              <li>Laundromat — 400 m</li>
                            </ul>

                            <h4 className="mt-4 font-semibold">Air Quality</h4>
                            <div className="mt-2">
                              <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">AQI 42 — Good</div>
                              <p className="text-xs text-muted-foreground mt-2">Lower AQI means cleaner air — a healthy place to study and sleep.</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold">Mini map</h4>
                            <div ref={miniMapRef} className="w-full h-48 rounded-md overflow-hidden bg-muted mb-3" />

                            <div className="flex items-center gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={toggleMiniMapType}>{miniMapType === 'roadmap' ? 'Satellite' : 'Map'}</Button>
                              <Button size="sm" onClick={openMiniStreetView}>Street View</Button>

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
                        </div>

                        <h4 className="mt-6 font-semibold">Reviews</h4>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 mt-2">
                          {(() => {
                            const aiList = (reviews && reviews.length ? reviews.slice(3,9) : []);
                            const needed = Math.max(0, 6 - aiList.length);
                            const demoExtras = Array.from({ length: needed }).map((_, i) => ({ author_name: `AI Demo ${i+1}`, rating: 5, relative_time_description: '2 days ago', text: 'Helpful stay, would recommend.' }));
                            const combined = aiList.concat(demoExtras).slice(0,6);
                            return combined.map((r: any, idx: number) => (
                              <div key={idx} className="p-2 border rounded">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-muted" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="font-semibold">{r.author_name || r.author}</div>
                                      <div className="text-sm text-muted-foreground">{r.rating} ★</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">{r.relative_time_description || 'some time ago'}</div>
                                    <p className="mt-2 text-sm">{r.text}</p>
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Note: AI insights offers a more detailed map (satellite + Street View) */}
            <div className="text-center mb-4 text-sm text-muted-foreground">View AI insight for more detailed map</div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {photos && photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {photos.slice(0,3).map((src, i) => (
                          <button key={i} onClick={() => { setSelectedPhoto(i); setPhotoDialogOpen(true); }} className="w-full h-32 overflow-hidden rounded-md">
                            <img loading="lazy" src={src} alt={`Photo ${i+1}`} className="object-cover w-full h-full" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-48 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No photos available</div>
                    )}
                    {photos && photos.length > 3 && <div className="text-sm text-muted-foreground mt-2">Showing {Math.min(3, photos.length)} of {photos.length} photos</div>}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">Satellite & Street View available in AI Insights</div>
                      </div>
                    </div>

                    <div ref={mapRef} id="gmaps" className="h-64 w-full rounded-md overflow-hidden bg-muted" />
                  </CardContent>
                </Card>
              </div>
            </div>


            {/* Ad after photos and map */}
            <div className="my-6">
              <Ad />
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
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
                <CardTitle>Google Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {reviews.slice(0,3).map((r: any, idx: number) => (
                      <div key={idx} className="p-2 border rounded">
                        <div className="flex items-start gap-3">
                          {r.profile_photo_url ? (
                            <img src={r.profile_photo_url} alt={r.author_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{r.author_name}</div>
                              <div className="text-sm text-muted-foreground">{r.rating} ★</div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{r.relative_time_description}</div>
                            <p className="mt-2 text-sm">{r.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No reviews available</div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">Reviews are aggregated from Google Reviews. When connected, ratings and excerpts will appear here.</p>
                <div className="mt-3 flex gap-2 items-center">
                  <Button size="sm" onClick={() => setAiDialogOpen(true)} className="bg-primary">Get Full Insight with AI</Button>
                </div>
              </CardContent>
            </Card>

            <div className="my-6">
              <Ad />
            </div>

            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogContent className="max-w-3xl w-[90vw]">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" onClick={() => setSelectedPhoto(p => Math.max(0, p - 1))} disabled={selectedPhoto === 0}>Prev</Button>
                    <div className="text-sm">{selectedPhoto + 1} / {photos?.length || 0}</div>
                    <Button variant="ghost" onClick={() => setSelectedPhoto(p => Math.min((photos?.length || 1) - 1, p + 1))} disabled={photos && selectedPhoto >= photos.length - 1}>Next</Button>
                  </div>
                  <img loading="lazy" src={photos && photos[selectedPhoto]} alt={`Photo ${selectedPhoto+1}`} className="w-full h-[60vh] object-contain" />
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;

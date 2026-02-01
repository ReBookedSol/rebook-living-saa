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
import { MapPin, Star, Phone, Mail, CheckCircle, ArrowLeft, Flag, Heart, Share, Building2, Lock, Image, Car, Footprints, Train } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { triggerWebhook } from "@/lib/webhook";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { useAccessControl, FREE_TIER_LIMITS } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { getPlaceData, getUserTier } from "@/lib/placeCache";
import { getGautrainStation, isGautrainAccessible } from "@/lib/gautrain";
import { loadGoogleMapsScript } from "@/lib/googleMapsConfig";
import type { GoogleReview } from "@/types/place-cache";

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

  const { data: listing, isLoading, error: queryError } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: async () => {
      if (!id) throw new Error("No accommodation ID provided");

      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching accommodation:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Accommodation not found");
      }

      return data;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch photos with tier-based limits enforced at database level
  const { data: tieredPhotos } = useQuery({
    queryKey: ["accommodation-photos", id, isPaidUser],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const { data, error } = await supabase.rpc('get_accommodation_photos', {
        p_accommodation_id: id,
        p_user_id: userId,
      });

      if (error) {
        console.warn('Failed to fetch tiered photos:', error);
        return null;
      }
      return data as string[] | null;
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

  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googlePhotos, setGooglePhotos] = useState<string[]>([]);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [travelInfo, setTravelInfo] = useState<{
    driving: { distance: string; duration: string } | null;
    walking: { distance: string; duration: string } | null;
  }>({ driving: null, walking: null });

  // Fetch place data from cache/API
  const { data: placeCache, isLoading: placeCacheLoading } = useQuery({
    queryKey: ["place-cache", listing?.property_name, listing?.address, accessLevel],
    queryFn: async () => {
      if (!listing) return null;
      const tier = getUserTier(accessLevel);
      return getPlaceData({
        property_name: listing.property_name,
        address: listing.address,
        city: listing.city || undefined,
        user_tier: tier,
        action: "listing",
      });
    },
    enabled: !!listing,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use cached photos/reviews if available, otherwise fall back to Google Maps API
  const allPhotos = placeCache?.photos?.length ? placeCache.photos : 
                    (passedImages && passedImages.length > 0 ? passedImages : googlePhotos);
  
  // Use server-side tiered photos if available, otherwise use cached/fetched images
  const photos = (tieredPhotos && tieredPhotos.length > 0) ? tieredPhotos : allPhotos;
  const allReviews = placeCache?.reviews?.length ? placeCache.reviews : googleReviews;
  const reviews = isPaidUser ? allReviews : allReviews?.slice(0, FREE_TIER_LIMITS.MAX_REVIEWS);
  const totalPhotos = placeCache?.photo_count || allPhotos?.length || 0;
  const totalReviews = placeCache?.review_count || allReviews?.length || 0;
  const hasMorePhotos = !isPaidUser && totalPhotos > FREE_TIER_LIMITS.MAX_PHOTOS;
  const hasMoreReviews = !isPaidUser && totalReviews > FREE_TIER_LIMITS.MAX_REVIEWS;
  const cacheHit = placeCache?.cached || false;
  const cacheAttributions = placeCache?.attributions;

  useEffect(() => {
    const loadAndInit = async () => {
      const success = await loadGoogleMapsScript();
      if (success) {
        initMap();
      } else {
        console.warn('Failed to load Google Maps');
      }
    };

    loadAndInit();

    function initMap() {
      try {
        const google = (window as any).google;
        if (!google || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -33.9249, lng: 18.4241 },
          zoom: 15,
          mapTypeId: 'roadmap',
          mapTypeControl: isPaidUser,
          mapTypeControlOptions: isPaidUser ? {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: ['roadmap', 'satellite'],
          } : undefined,
          streetViewControl: isPaidUser,
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

              // Calculate distance to university if available
              if (isPaidUser && listing?.university) {
                const universityQuery = `${listing.university}, South Africa`;
                const geocoder = new google.maps.Geocoder();
                
                geocoder.geocode({ address: universityQuery }, (uniResults: any, uniStatus: any) => {
                  if (uniStatus === google.maps.GeocoderStatus.OK && uniResults[0]) {
                    const universityLocation = uniResults[0].geometry.location;
                    
                    // Add university marker
                    new google.maps.Marker({
                      map,
                      position: universityLocation,
                      title: listing.university,
                      icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" },
                    });

                    // Fit bounds to show both markers
                    const bounds = new google.maps.LatLngBounds();
                    bounds.extend(place.geometry.location);
                    bounds.extend(universityLocation);
                    map.fitBounds(bounds);

                    // Calculate travel times
                    const directionsService = new google.maps.DirectionsService();
                    
                    // Driving
                    directionsService.route({
                      origin: place.geometry.location,
                      destination: universityLocation,
                      travelMode: google.maps.TravelMode.DRIVING,
                    }, (result: any, dStatus: any) => {
                      if (dStatus === google.maps.DirectionsStatus.OK) {
                        const route = result.routes[0].legs[0];
                        setTravelInfo(prev => ({
                          ...prev,
                          driving: { distance: route.distance.text, duration: route.duration.text },
                        }));
                      }
                    });

                    // Walking
                    directionsService.route({
                      origin: place.geometry.location,
                      destination: universityLocation,
                      travelMode: google.maps.TravelMode.WALKING,
                    }, (result: any, wStatus: any) => {
                      if (wStatus === google.maps.DirectionsStatus.OK) {
                        const route = result.routes[0].legs[0];
                        setTravelInfo(prev => ({
                          ...prev,
                          walking: { distance: route.distance.text, duration: route.duration.text },
                        }));
                      }
                    });
                  }
                });
              }
            }

            service.getDetails({ placeId: place.place_id, fields: ['reviews', 'rating', 'name', 'photos', 'url'] }, (detail: any, dStatus: any) => {
              if (dStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                // Only set Google reviews/photos as fallback if cache didn't have data
                // Limit reviews based on tier (paid users get up to 10, free users get up to 1)
                const maxGoogleReviews = isPaidUser ? 10 : 1;
                if (detail.reviews) {
                  const formattedReviews = detail.reviews.slice(0, maxGoogleReviews).map((r: any) => ({
                    author_name: r.author_name,
                    author_url: r.author_url,
                    profile_photo_url: r.profile_photo_url,
                    rating: r.rating,
                    relative_time_description: r.relative_time_description,
                    text: r.text,
                    time: r.time,
                  }));
                  setGoogleReviews(formattedReviews);
                }
                // Optimization: For free users, only set Google photos if we don't already have photos from DB or cache
                // This prevents wasting API quota by fetching photos we won't display
                const hasPhotosFromSource = (tieredPhotos && tieredPhotos.length > 0) || (placeCache?.photos?.length);
                const shouldFetchGooglePhotos = isPaidUser || !hasPhotosFromSource;

                if (shouldFetchGooglePhotos && detail.photos && detail.photos.length > 0) {
                  try {
                    const maxGooglePhotos = isPaidUser ? 10 : 3;
                    const photoUrls = detail.photos.slice(0, maxGooglePhotos).map((p: any) => p.getUrl({ maxWidth: 800 }));
                    setGooglePhotos(photoUrls);
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
      // Only allow satellite for paid users
      const allowedMapType = !isPaidUser && mapType === 'satellite' ? 'roadmap' : mapType;
      mapInstanceRef.current.setMapTypeId(allowedMapType);
    }
  }, [mapType, isPaidUser]);

  const toggleReviewExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const enterStreetView = () => {
    if (!isPaidUser) {
      toast.error('Street View is available with a premium pass');
      return;
    }
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

  if (isLoading || accessLoading) {
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

  if (queryError || !listing) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Listing not found</h1>
              <p className="text-muted-foreground mb-6">
                {queryError
                  ? `Error: ${(queryError as any).message || "Failed to load listing"}`
                  : "The accommodation you're looking for doesn't exist or has been removed."}
              </p>
              <Link to={returnPath}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to listings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
          {/* Back Button */}
          <Link to={returnPath} className="inline-block mb-4">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {/* Header Card */}
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col gap-4 md:gap-6">
                {/* Top section with badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {listing.is_landlord_listing && (
                    <Badge className="bg-green-500 text-white gap-1 text-xs">
                      <Building2 className="w-3 h-3" />
                      Listed by Landlord
                    </Badge>
                  )}
                  {listing.nsfas_accredited && (
                    <Badge className="bg-blue-500 text-white gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      NSFAS Accredited
                    </Badge>
                  )}
                </div>

                {/* Main title and location */}
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">{listing.property_name || "Listing"}</h1>
                  {listing.address && (
                    <div className="flex items-start gap-1 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base">
                        {listing.address}
                        {listing.city && `, ${listing.city}`}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {listing.type && <Badge variant="secondary" className="text-xs">{listing.type}</Badge>}
                    {listing.gender_policy && <Badge variant="secondary" className="text-xs">{listing.gender_policy}</Badge>}
                    {listing.rooms_available && (
                      <Badge variant="secondary" className="text-xs">{listing.rooms_available} rooms</Badge>
                    )}
                  </div>
                </div>

                {/* Bottom section - rating and actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-center bg-accent/10 px-3 py-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-xl md:text-2xl font-bold">{(listing.rating || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFavorite}
                      className="rounded-full"
                      disabled={savingFavorite}
                      title={isSaved ? 'Remove favorite' : 'Save favorite'}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareListing}
                      className="rounded-full"
                      title="Share listing"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full" title="Report listing">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photos Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="border-b bg-muted/30 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <CardTitle className="text-base md:text-lg">Gallery</CardTitle>
                    </div>
                    {hasMorePhotos && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Badge variant="secondary" className="text-xs">
                          More Photos Available
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {photos && photos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
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
                            buttonText="Unlock More Photos"
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
                <CardHeader className="border-b bg-muted/30 px-4 md:px-6 py-3 md:py-4">
                  <CardTitle className="text-base md:text-lg">About this property</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                  {listing.description && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
                      <p className="text-foreground text-sm leading-relaxed">{listing.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">University</h3>
                      <p className="text-foreground text-sm font-medium">{listing.university}</p>
                      {listing.university && (
                        <div className="mt-2">
                          {isGautrainAccessible(listing.university) ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                <Train className="w-3 h-3" />
                                {getGautrainStation(listing.university)}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">{getGautrainStation(listing.university) || 'Not on Gautrain line'}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {listing.units && (
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Available Units</h3>
                        <p className="text-foreground text-sm font-medium">{listing.units} units</p>
                      </div>
                    )}
                  </div>

                  {listing.amenities && Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="border-primary/20 bg-primary/5">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.certified_universities && Array.isArray(listing.certified_universities) && listing.certified_universities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2">Accredited For</h3>
                      <div className="space-y-1">
                        {listing.certified_universities.map((uni: string) => (
                          <div key={uni} className="flex items-center gap-2 text-foreground text-sm">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                            <span>{uni}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.website && (
                    <div className="pt-3 border-t">
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-1">Website</h3>
                      <a href={listing.website} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all text-xs md:text-sm">
                        {listing.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Card */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">Location</CardTitle>
                    {!isPaidUser && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  {isPaidUser && (
                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                      >
                        {mapType === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}
                      </Button>
                      <Button size="sm" onClick={() => enterStreetView()} className="text-xs">
                        Street View
                      </Button>
                    </div>
                  )}
                  <div ref={mapRef} id="gmaps" className="h-60 md:h-80 w-full rounded-lg overflow-hidden bg-muted" />
                  
                  {/* Travel Times - Pro users only */}
                  {isPaidUser && listing.university && (travelInfo.driving || travelInfo.walking) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Distance to {listing.university}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {travelInfo.driving && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Car className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium">Driving</span>
                            </div>
                            <p className="text-sm font-semibold">{travelInfo.driving.duration}</p>
                            <p className="text-xs text-muted-foreground">{travelInfo.driving.distance}</p>
                          </div>
                        )}
                        {travelInfo.walking && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Footprints className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium">Walking</span>
                            </div>
                            <p className="text-sm font-semibold">{travelInfo.walking.duration}</p>
                            <p className="text-xs text-muted-foreground">{travelInfo.walking.distance}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upgrade prompt for free users */}
                  {!isPaidUser && (
                    <div className="pt-3 border-t">
                      <UpgradePrompt type="map" compact buttonText="Unlock travel times & satellite view" />
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
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6 lg:sticky lg:top-20">
              {/* Contact Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 md:p-6">
                  {listing.monthly_cost !== null && listing.monthly_cost !== undefined && (
                    <div className="mb-4 md:mb-6">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-1">R{listing.monthly_cost.toLocaleString()}</div>
                      <p className="text-xs md:text-sm text-muted-foreground">per month</p>
                    </div>
                  )}

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                    {listing.contact_phone && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5 md:mt-1" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="font-medium text-xs md:text-sm break-all">{listing.contact_phone}</p>
                        </div>
                      </div>
                    )}
                    {listing.contact_email && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5 md:mt-1" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="font-medium text-xs md:text-sm break-all">{listing.contact_email}</p>
                        </div>
                      </div>
                    )}
                    {listing.contact_person && (
                      <div className="flex items-start gap-2 md:gap-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Contact Person</p>
                        <p className="font-medium text-xs md:text-sm">{listing.contact_person}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {listing.contact_phone && (
                      <a href={`tel:${listing.contact_phone}`} className="block">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                          <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                          Call Now
                        </Button>
                      </a>
                    )}
                    {listing.contact_email && (
                      <a href={`mailto:${listing.contact_email}`} className="block">
                        <Button variant="outline" className="w-full text-sm">
                          <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                          Send Email
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unified Reviews Section */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-muted/30 px-4 md:px-6 py-3 md:py-4">
                  <CardTitle className="text-base md:text-lg">Reviews & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3 md:space-y-4">
                    {/* Review Form */}
                    <div className="pb-3 md:pb-4 border-b">
                      <ReviewForm
                        accommodationId={id || ""}
                        onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)}
                      />
                    </div>

                    {/* All Reviews */}
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wide mb-2 md:mb-3">All Reviews</h3>
                      <div className="space-y-2 md:space-y-3 max-h-[50vh] overflow-y-auto">
                        {/* ReBooked Living Reviews */}
                        <ReviewsList
                          accommodationId={id}
                          onReviewsUpdated={() => setReviewsRefreshTrigger(prev => prev + 1)}
                          maxReviews={isPaidUser ? undefined : FREE_TIER_LIMITS.MAX_REVIEWS}
                        />

                        {/* Google Reviews */}
                        {reviews && reviews.length > 0 && (
                          <>
                            <div className="my-2 md:my-3 text-center text-xs text-muted-foreground">
                              ─ Google Reviews ─
                            </div>
                            {reviews.map((r: any, idx: number) => {
                              const reviewId = `google-${idx}`;
                              const isExpanded = expandedReviews.has(reviewId);
                              const isTruncated = r.text && r.text.length > 150;
                              return (
                                <div key={reviewId} className="p-2 md:p-2.5 bg-muted/30 rounded-lg border border-muted text-xs md:text-sm">
                                  <div className="flex gap-2 items-start mb-1">
                                    {r.profile_photo_url ? (
                                      <img src={r.profile_photo_url} alt={r.author_name} className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-muted flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 justify-between mb-0.5">
                                        <div className="flex items-center gap-1">
                                          <p className="font-semibold text-xs truncate">{r.author_name}</p>
                                          <span className="text-xs px-1 py-0 bg-blue-100 text-blue-700 rounded-full">Google</span>
                                        </div>
                                        <span className="text-xs text-yellow-500 font-medium flex-shrink-0">{r.rating}★</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{r.relative_time_description}</p>
                                    </div>
                                  </div>
                                  <p className={`text-xs text-foreground ${!isExpanded && isTruncated ? 'line-clamp-2' : ''}`}>{r.text}</p>
                                  {isTruncated && (
                                    <button
                                      onClick={() => toggleReviewExpand(reviewId)}
                                      className="text-xs text-primary hover:underline mt-1 font-medium"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            {hasMoreReviews && (
                              <div className="mt-2 md:mt-3 p-2 md:p-2.5 bg-muted/50 rounded-lg">
                                <UpgradePrompt
                                  type="reviews"
                                  totalCount={totalReviews}
                                  compact
                                  buttonText="View More Reviews"
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
          </div>
        </div>

        {/* Photo Dialog */}
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent className="max-w-2xl md:max-w-4xl w-[90vw] md:w-[95vw] p-2 md:p-4 rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(p => Math.max(0, p - 1))}
                  disabled={selectedPhoto === 0}
                  className="text-xs md:text-sm"
                >
                  ← Prev
                </Button>
                <p className="text-xs md:text-sm font-medium">{selectedPhoto + 1} / {photos?.length || 0}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(p => Math.min((photos?.length || 1) - 1, p + 1))}
                  disabled={photos && selectedPhoto >= photos.length - 1}
                  className="text-xs md:text-sm"
                >
                  Next →
                </Button>
              </div>
              <img loading="lazy" src={photos && photos[selectedPhoto]} alt={`Photo ${selectedPhoto+1}`} className="w-full h-[40vh] md:h-[65vh] object-contain rounded-xl" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ListingDetail;

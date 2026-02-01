import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Heart, Share, Building2, Lock, Train } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCachedPhoto, setCachedPhoto } from "@/lib/addressPhotoCache";
import { useAccessControl, FREE_TIER_LIMITS } from "@/hooks/useAccessControl";
import { getPlaceData } from "@/lib/placeCache";
import { getGautrainStation, isGautrainAccessible } from "@/lib/gautrain";
import { loadGoogleMapsScript } from "@/lib/googleMapsConfig";

interface AccommodationCardProps {
  id: string;
  propertyName: string;
  type: string;
  university: string;
  address: string;
  city: string;
  monthlyCost?: number | null;
  rating: number;
  nsfasAccredited: boolean;
  genderPolicy: string;
  website?: string | null;
  amenities?: string[];
  imageUrls?: string[] | null;
  isLandlordListing?: boolean;
}

const AccommodationCard = ({
  id,
  propertyName,
  type,
  university,
  address,
  city,
  monthlyCost,
  rating,
  nsfasAccredited,
  genderPolicy,
  website,
  amenities = [],
  imageUrls = null,
  isLandlordListing = false,
}: AccommodationCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { accessLevel } = useAccessControl();
  const isPaidUser = accessLevel === "paid";
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showPremiumBorderAnimation, setShowPremiumBorderAnimation] = useState(false);

  const shareListing = async () => {
    const url = `${window.location.origin}/listing/${id}`;
    const title = propertyName;
    const text = `${propertyName}${university ? ` — near ${university}` : ''}`;

    // Preferred: try native share if available
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        toast({ title: 'Shared', description: 'Share dialog opened' });
        return;
      } catch (err: any) {
        // Permission denied / NotAllowed - try clipboard fallback
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            toast({ title: 'Link copied', description: 'Listing link copied to clipboard' });
            return;
          }
        } catch (e) {
          // ignore
        }
        // final fallback
        // eslint-disable-next-line no-alert
        prompt('Copy this link', url);
        return;
      }
    }

    // No native share - try clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', description: 'Listing link copied to clipboard' });
        return;
      } catch (err) {
        // ignore and fallthrough to prompt
      }
    }

    // Last resort
    // eslint-disable-next-line no-alert
    prompt('Copy this link', url);
  };

  // Check for premium animation flag and clear it after animation
  useEffect(() => {
    if (isPaidUser && sessionStorage.getItem("justPaid") === "true") {
      setShowPremiumBorderAnimation(true);
      // Clear the flag and animation after 2.5 seconds (duration of animation)
      const timer = setTimeout(() => {
        setShowPremiumBorderAnimation(false);
        sessionStorage.removeItem("justPaid");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPaidUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;
      const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId).eq("accommodation_id", id).single();
      if (!mounted) return;
      if (error) return;
      setIsSaved(!!data);
    })();
    return () => { mounted = false; };
  }, [id]);

  const toggleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      navigate('/auth');
      return;
    }

    // optimistic UI + animation
    setAnimating(true);
    const prev = isSaved;
    setIsSaved(!prev);
    setLoading(true);
    try {
      if (!prev) {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, accommodation_id: id });
        if (error) throw error;
        toast({ title: 'Saved', description: 'Added to your saved properties' });
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('accommodation_id', id);
        if (error) throw error;
        toast({ title: 'Removed', description: 'Removed from your saved properties' });
      }
    } catch (err: any) {
      // revert optimistic change
      setIsSaved(prev);
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
      // small pop animation
      setTimeout(() => setAnimating(false), 350);
    }
  };

  const [localImages, setLocalImages] = useState<string[] | null>(imageUrls && imageUrls.length > 0 ? imageUrls : null);
  const thumb = localImages && localImages.length > 0 ? localImages[0] : '/placeholder.svg';

  const handleImgError = (idx?: number) => (e: any) => {
    (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
    if (typeof idx === 'number') {
      setLocalImages((prev) => (prev ? prev.filter((_, i) => i !== idx) : prev));
    }
  };

  // Use place cache for browse page photos - always fetch with "free" tier for browse
  const { data: placeCache } = useQuery({
    queryKey: ["place-cache-browse", address, propertyName],
    queryFn: async () => {
      return getPlaceData({
        property_name: propertyName,
        address: address,
        city: city,
        user_tier: "free", // Browse always uses free tier display limits
        action: "browse",
      });
    },
    enabled: !(localImages && localImages.length > 0), // Only fetch if no local images
    staleTime: 1000 * 60 * 30, // 30 minutes - browse cards don't need frequent updates
  });

  // Set photos from cache if available
  useEffect(() => {
    if (placeCache?.photos && placeCache.photos.length > 0 && !(localImages && localImages.length > 0)) {
      setLocalImages(placeCache.photos);
      // Also update the local address cache
      if (placeCache.photos[0]) {
        setCachedPhoto(address, placeCache.photos[0]);
      }
    }
  }, [placeCache, address, localImages]);

  // Fallback: Fetch Google Places photo if cache fails and no local images
  // Only for paid users as a backup
  useEffect(() => {
    if (!isPaidUser) return; // Skip for free users
    if (localImages && localImages.length > 0) return; // Already have images
    if (placeCache?.photos && placeCache.photos.length > 0) return; // Cache has photos

    // Check local cache first
    const cachedPhoto = getCachedPhoto(address);
    if (cachedPhoto) {
      setLocalImages([cachedPhoto]);
      return;
    }

    const loadGoogleMapsAndFetchPhoto = async () => {
      try {
        // Load Google Maps script with the API key from Supabase secrets
        const scriptLoaded = await loadGoogleMapsScript();
        if (!scriptLoaded) {
          console.warn('Failed to load Google Maps script');
          return;
        }

        const ggl = (window as any).google;
        if (!ggl?.maps?.places) {
          console.warn('Google Maps Places API not available');
          return;
        }

        const map = new ggl.maps.Map(document.createElement('div'), { zoom: 15 });
        const service = new ggl.maps.places.PlacesService(map);
        const addressQuery = [propertyName, address, city, university].filter(Boolean).join(', ');

        service.findPlaceFromQuery(
          {
            query: addressQuery || propertyName || address || city,
            fields: ['place_id', 'geometry', 'name'],
          },
          (results: any, status: any) => {
            if (status === ggl.maps.places.PlacesServiceStatus.OK && results?.[0]) {
              const placeId = results[0].place_id;
              service.getDetails(
                { placeId, fields: ['photos'] },
                (detail: any, dStatus: any) => {
                  if (dStatus === ggl.maps.places.PlacesServiceStatus.OK && detail?.photos?.[0]) {
                    try {
                      const photoUrl = detail.photos[0].getUrl({ maxWidth: 400 });
                      setLocalImages([photoUrl]);
                      setCachedPhoto(address, photoUrl);
                    } catch (err) {
                      console.warn('Failed to extract photo url', err);
                    }
                  }
                }
              );
            }
          }
        );
      } catch (err) {
        console.warn('Failed to fetch Google Places photo', err);
      }
    };

    loadGoogleMapsAndFetchPhoto();
  }, [id, address, isPaidUser, placeCache]);


  // Apply image limit for free users
  const displayImages = !isPaidUser && imageUrls ? imageUrls.slice(0, FREE_TIER_LIMITS.MAX_PHOTOS) : imageUrls;

  return (
    <Link
      to={`/listing/${id}?return=${encodeURIComponent(location.pathname + location.search)}`}
      state={{ images: (localImages && localImages.length > 0) ? localImages : (displayImages && displayImages.length > 0) ? displayImages : [thumb] }}
      className="block group"
    >
      <Card
        className={`overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col ${
          showPremiumBorderAnimation
            ? "border-2"
            : isPaidUser
            ? "border-2 border-yellow-500"
            : "border border-primary/20"
        }`}
        style={showPremiumBorderAnimation ? {
          animation: "premiumBorderPulse 2.5s ease-in-out forwards",
          borderColor: "rgb(59 130 246 / 0.2)"
        } : isPaidUser ? {
          borderColor: "#d4af37"
        } : {}}
      >
        {/* Image Section with Overlay */}
        <div className="relative w-full h-56 overflow-hidden bg-muted group-hover:brightness-95 transition-all duration-300">
          {/* Always show images on cards - no paywall on browse cards */}
          {localImages && localImages.length > 0 ? (
            <img
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              src={localImages[0]}
              alt={propertyName}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={handleImgError(0)}
            />
          ) : (
            <img loading="lazy" decoding="async" referrerPolicy="no-referrer" src={thumb} alt={propertyName} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" onError={handleImgError()} />
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isLandlordListing && (
              <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-lg">
                <Building2 className="w-3 h-3 mr-1" />
                Landlord
              </Badge>
            )}
            {nsfasAccredited && (
              <Badge className="bg-white text-primary shadow-lg font-semibold">
                <CheckCircle className="w-3 h-3 mr-1" />
                NSFAS
              </Badge>
            )}
          </div>
        </div>

        {/* Header with Title and Price */}
        <div className="p-4 pb-2 flex-shrink-0">
          <h3 className="font-bold text-lg leading-snug text-foreground line-clamp-2 mb-1">{propertyName}</h3>
          <p className="text-xs text-muted-foreground font-medium">{type} • {city}</p>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 py-3 flex-1">
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">{address || city}</div>
            </div>

            {/* University and Rating Row */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground font-medium">
                  {university}
                </div>
                {university && (
                  <div className="flex items-center gap-1.5">
                    {isGautrainAccessible(university) ? (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        {getGautrainStation(university)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{getGautrainStation(university) || 'Not on Gautrain'}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[0,1,2,3,4].map((i) => {
                  const diff = (rating || 0) - i;
                  if (diff >= 1) {
                    return <Star key={i} className="w-3.5 h-3.5 text-accent" fill="currentColor" />;
                  }
                  if (diff > 0 && diff < 1) {
                    return (
                      <span key={i} className="relative inline-block w-3.5 h-3.5">
                        <Star className="absolute inset-0 w-3.5 h-3.5 text-muted-foreground" />
                        <Star className="absolute inset-0 w-3.5 h-3.5 text-accent" fill="currentColor" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                      </span>
                    );
                  }
                  return <Star key={i} className="w-3.5 h-3.5 text-muted-foreground" />;
                })}
                <span className="text-xs font-semibold ml-1 text-foreground">{(rating || 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Gender Policy and NSFAS Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">{genderPolicy || 'Mixed'}</span>
              </div>
              {nsfasAccredited && (
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Amenities:</span> {amenities.slice(0,2).join(", ")}{amenities.length > 2 ? '...' : ''}
              </div>
            )}
          </div>
        </CardContent>

        {/* Price Section */}
        <div className="px-4 py-2 bg-gradient-to-r from-primary/5 to-accent/5 border-t">
          <p className="text-lg font-bold text-primary">{typeof monthlyCost === 'number' ? `R${monthlyCost.toLocaleString()}` : 'Contact'}</p>
          <p className="text-xs text-muted-foreground">per month</p>
        </div>

        {/* Action Buttons */}
        <CardFooter className="p-4 pt-3 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); shareListing(); }} className="rounded-lg h-8 px-2 text-primary hover:bg-primary/10 text-xs">
              <Share className="w-4 h-4" />
            </Button>
          </div>

          <div onClick={(e) => e.preventDefault()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSave}
              className={`h-8 w-8 rounded-lg transition-all duration-200 ${isSaved ? 'bg-accent/10 text-accent' : 'text-primary hover:bg-primary/10'}`}
              aria-pressed={isSaved}
              disabled={loading}
              title={isSaved ? 'Remove saved' : 'Save'}
            >
              <Heart className={`w-4 h-4 transition-transform duration-200 ${animating ? 'scale-125' : ''}`} fill={isSaved ? "currentColor" : "none"} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AccommodationCard;

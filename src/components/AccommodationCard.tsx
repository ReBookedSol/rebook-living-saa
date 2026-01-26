import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Info, Heart, Share, Building2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getCachedPhoto, setCachedPhoto } from "@/lib/addressPhotoCache";

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
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

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

  // Fetch Google Places photo if no local images (with caching by address prefix)
  useEffect(() => {
    if (localImages && localImages.length > 0) return; // Already have images

    // Check cache first
    const cachedPhoto = getCachedPhoto(address);
    if (cachedPhoto) {
      setLocalImages([cachedPhoto]);
      return;
    }

    const apiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API;
    if (!apiKey) return;

    const loadGoogleMapsAndFetchPhoto = async () => {
      try {
        const google = (window as any).google;

        // Wait for Google Maps if not loaded
        if (!google?.maps?.places) {
          const existing = document.getElementById('google-maps-script-card');
          if (!existing) {
            const script = document.createElement('script');
            script.id = 'google-maps-script-card';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load Google Maps'));
            });
          } else {
            await new Promise<void>((resolve) => {
              const checkGoogle = setInterval(() => {
                if ((window as any).google?.maps?.places) {
                  clearInterval(checkGoogle);
                  resolve();
                }
              }, 100);
              setTimeout(() => {
                clearInterval(checkGoogle);
                resolve();
              }, 5000);
            });
          }
        }

        const ggl = (window as any).google;
        if (!ggl?.maps?.places) return;

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
  }, [id, address]);


  return (
    <Link
      to={`/listing/${id}?return=${encodeURIComponent(location.pathname + location.search)}`}
      state={{ images: (localImages && localImages.length > 0) ? localImages : (imageUrls && imageUrls.length > 0) ? imageUrls : [thumb] }}
      className="block"
    >
      <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
        {localImages && localImages.length > 0 ? (
          <div className="w-full h-48 overflow-hidden bg-muted">
            <img
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              src={localImages[0]}
              alt={propertyName}
              className="object-cover w-full h-full"
              onError={handleImgError(0)}
            />
          </div>
        ) : (
          <div className="w-full h-48 overflow-hidden bg-muted">
            <img loading="lazy" decoding="async" referrerPolicy="no-referrer" src={thumb} alt={propertyName} className="object-cover w-full h-full" onError={handleImgError()} />
          </div>
        )}

        <div className="relative py-4 px-4" style={{ background: 'hsl(var(--primary))' }}>
          <div className="absolute top-2 right-3 flex items-center gap-2">
            {isLandlordListing && (
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                <Building2 className="w-3 h-3 mr-1" />
                Listed by Landlord
              </Badge>
            )}
            {nsfasAccredited && (
              <Badge style={{ background: 'white', color: 'hsl(var(--primary))' }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                NSFAS
              </Badge>
            )}
          </div>
          <div className="flex-1 text-white">
            <h3 className="font-semibold text-lg leading-tight text-white">{propertyName}</h3>
            <p className="text-xs text-white/90">{type} • {city}</p>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{address || city}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {university}
                {nsfasAccredited && (
                  <span title={`NSFAS accredited for ${university}`} className="inline-flex items-center ml-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{genderPolicy || 'Mixed'}</div>
                <div className="flex items-center gap-1">
                  {[0,1,2,3,4].map((i) => {
                    const diff = (rating || 0) - i;
                    if (diff >= 1) {
                      return <Star key={i} className="w-4 h-4 text-accent" fill="currentColor" />;
                    }
                    if (diff > 0 && diff < 1) {
                      return (
                        <span key={i} className="relative inline-block w-4 h-4">
                          <Star className="absolute inset-0 w-4 h-4 text-muted-foreground" />
                          <Star className="absolute inset-0 w-4 h-4 text-accent" fill="currentColor" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                        </span>
                      );
                    }
                    return <Star key={i} className="w-4 h-4 text-muted-foreground" />;
                  })}
                  <span className="ml-1">{(rating || 0).toFixed(1)}</span>
                </div>
              </div>

              {amenities.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <strong className="text-sm">Amenities:</strong> {amenities.slice(0,3).join(", ")}{amenities.length > 3 ? '...' : ''}
                </div>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-primary">{typeof monthlyCost === 'number' ? `R${monthlyCost.toLocaleString()}` : 'Contact for price'}</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full border border-primary/20 w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10">
                  <Info className="w-4 h-4 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs w-[90vw] rounded-xl p-4">
                <DialogHeader>
                  <DialogTitle className="text-base">{propertyName} — Info</DialogTitle>
                  <DialogDescription>
                    <p className="mt-2 text-sm">Gender policy: <span className="font-medium">{genderPolicy || 'Mixed'}</span></p>
                    <p className="mt-2 text-sm">NSFAS accredited: <span className="font-medium">{nsfasAccredited ? 'Yes' : 'No'}</span></p>
                    <p className="mt-2 text-sm">University: <span className="font-medium">{university}</span></p>
                    {amenities.length > 0 && <p className="mt-2 text-sm">Amenities: <span className="font-medium">{amenities.join(', ')}</span></p>}
                    {website && (
                      <p className="mt-2 text-sm">Website: <a href={website} target="_blank" rel="noreferrer" className="text-primary underline">Visit</a></p>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">For bursaries and university info see: <a href="https://www.rebookedsolutions.co.za/university-info" target="_blank" rel="noreferrer" className="text-primary underline">University Info</a></p>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-end">
                  <DialogClose asChild>
                    <Button className="bg-primary text-white">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); shareListing(); }} className="rounded-full border border-primary/20 w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10">
              <Share className="w-4 h-4 text-primary" />
            </Button>
          </div>

          <div onClick={(e) => e.preventDefault()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSave}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transform transition-all duration-200 ${isSaved ? 'bg-green-50 border-green-200 text-green-600' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
              aria-pressed={isSaved}
              disabled={loading}
              title={isSaved ? 'Remove saved' : 'Save'}
            >
              <Heart className={`w-5 h-5 transition-transform duration-200 ${isSaved ? 'text-green-600' : 'text-primary'} ${animating ? 'scale-125' : ''}`} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AccommodationCard;

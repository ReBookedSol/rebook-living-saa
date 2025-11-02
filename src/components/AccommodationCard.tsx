import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Info, Heart, Share } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  // If no imageUrls were provided from the server, fetch a single thumbnail for this card only.
  // This runs per-card when the card mounts (so only accommodations rendered on the current page will fetch).
  useEffect(() => {
    if (localImages && localImages.length > 0) return;
    // Only attempt to fetch a thumbnail if we have a sensible query
    const query = [propertyName, address, city].filter(Boolean).join(', ');
    if (!query) return;

    const apiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API;
    if (!apiKey) return;

    let mounted = true;
    const fetchThumb = () => {
      try {
        const google = (window as any).google;
        if (!google) return;
        const tempDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(tempDiv);
        service.findPlaceFromQuery({ query, fields: ['place_id'] }, (results: any, status: any) => {
          if (!mounted) return;
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            const place = results[0];
            service.getDetails({ placeId: place.place_id, fields: ['photos'] }, (detail: any, dStatus: any) => {
              if (!mounted) return;
              if (dStatus === google.maps.places.PlacesServiceStatus.OK && detail && detail.photos && detail.photos.length > 0) {
                try {
                  const p = detail.photos[0];
                  if (p && typeof p.getUrl === 'function') {
                    const url = p.getUrl({ maxWidth: 800 });
                    if (url) setLocalImages([url]);
                  }
                } catch (err) {
                  // ignore malformed photo
                }
              }
            });
          }
        });
      } catch (err) {
        // ignore
      }
    };

    const existing = document.getElementById('google-maps-script');
    if (existing) {
      if ((window as any).google) {
        fetchThumb();
      } else {
        const onLoad = () => fetchThumb();
        existing.addEventListener('load', onLoad as any, { once: true } as any);
        return () => { mounted = false; existing.removeEventListener('load', onLoad as any); };
      }
    } else {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => fetchThumb();
      script.onerror = () => { /* failed to load maps - just ignore */ };
      document.head.appendChild(script);

      // cleanup: do not remove the script (might be used by ListingDetail later); just mark unmounted
      return () => { mounted = false; };
    }

    return () => { mounted = false; };
  }, [imageUrls, localImages, propertyName, address, city]);

  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
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
        {nsfasAccredited && (
          <Badge className="absolute" style={{ top: 8, right: 12, background: 'white', color: 'hsl(var(--primary))' }}>
            <CheckCircle className="w-3 h-3 mr-1" />
            NSFAS
          </Badge>
        )}
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
        <div className="flex items-center gap-2">
          <Link to={`/listing/${id}?return=${encodeURIComponent(location.pathname + location.search)}`} state={{ images: (localImages && localImages.length > 0) ? localImages : (imageUrls && imageUrls.length > 0) ? imageUrls : [thumb] }}>
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary-hover rounded-full">
              View Details
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-primary/20 w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10">
                <Info className="w-4 h-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm w-full rounded-xl p-4">
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

          <Button variant="ghost" size="sm" onClick={shareListing} className="rounded-full border border-primary/20 w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10">
            <Share className="w-4 h-4 text-primary" />
          </Button>
        </div>

        <div>
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
  );
};

export default AccommodationCard;

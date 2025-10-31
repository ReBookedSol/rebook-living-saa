import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Info, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface AccommodationCardProps {
  id: string;
  propertyName: string;
  type: string;
  university: string;
  address: string;
  city: string;
  monthlyCost: number;
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
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      if (!isSaved) {
        const { error } = await supabase.from('favorites').insert({ user_id: userId, accommodation_id: id });
        if (error) throw error;
        setIsSaved(true);
        toast({ title: 'Saved', description: 'Added to your saved properties' });
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('accommodation_id', id);
        if (error) throw error;
        setIsSaved(false);
        toast({ title: 'Removed', description: 'Removed from your saved properties' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const thumb = imageUrls && imageUrls.length > 0 ? imageUrls[0] : '/placeholder.svg';

  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
      <div className="w-full h-48 overflow-hidden bg-muted">
        <img src={thumb} alt={propertyName} className="object-cover w-full h-full" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
      </div>

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
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent" />{(rating || 0).toFixed(1)}</div>
            </div>

            {amenities.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                <strong className="text-sm">Amenities:</strong> {amenities.slice(0,3).join(", ")}{amenities.length > 3 ? '...' : ''}
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-primary">R{monthlyCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/listing/${id}`}>
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
        </div>

        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSave}
            className={`w-10 h-10 flex items-center justify-center rounded-full border ${isSaved ? 'bg-green-50 border-green-200 text-green-600' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
            aria-pressed={isSaved}
            disabled={loading}
            title={isSaved ? 'Remove saved' : 'Save'}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'text-green-600' : 'text-primary'}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccommodationCard;

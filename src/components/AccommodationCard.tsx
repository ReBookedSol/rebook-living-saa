import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
}: AccommodationCardProps) => {
  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
      <div className="relative min-h-[88px] py-4 flex items-start px-4" style={{ background: 'hsl(var(--primary))' }}>
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
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 w-8 h-8 flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm w-full">
              <DialogHeader>
                <DialogTitle className="text-base">{propertyName} — Info</DialogTitle>
                <DialogDescription>
                  <p className="mt-2">Gender policy: {genderPolicy || 'Mixed'}</p>
                  <p className="mt-2">NSFAS accredited: {nsfasAccredited ? 'Yes' : 'No'}</p>
                  <p className="mt-2">University: {university}</p>
                  {amenities.length > 0 && <p className="mt-2">Amenities: {amenities.join(', ')}</p>}
                  {website && (
                    <p className="mt-2">Website: <a href={website} target="_blank" rel="noreferrer" className="text-primary underline">Visit</a></p>
                  )}
                  <p className="mt-4 text-sm text-muted-foreground">For bursaries and university info see: <a href="https://www.rebookedsolutions.co.za/university-info" target="_blank" rel="noreferrer" className="text-primary underline">University Info</a></p>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex justify-end">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AccommodationCard;

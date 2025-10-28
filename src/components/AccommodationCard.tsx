import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, CheckCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface AccommodationCardProps {
  id: string;
  propertyName: string;
  type: string;
  university: string;
  address: string;
  city: string;
  monthlyCost: number;
  rating: number;
  imageUrl: string;
  nsfasAccredited: boolean;
  genderPolicy: string;
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
  imageUrl,
  nsfasAccredited,
  genderPolicy,
}: AccommodationCardProps) => {
  return (
    <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
      <div className="relative h-20 flex items-center px-4" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--muted)))' }}>
        {nsfasAccredited && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            NSFAS
          </Badge>
        )}

        <div className="flex-1 text-white">
          <h3 className="font-semibold text-lg leading-tight text-white">{propertyName}</h3>
          <p className="text-xs text-white/90">{type} • {city}</p>
        </div>

        <button aria-label="Save listing" className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow">
          <Heart className="w-4 h-4 text-primary" />
        </button>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{address || city}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{university}</p>
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{genderPolicy || 'Mixed'}</div>
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent" />{rating.toFixed(1)}</div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary">R{monthlyCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Link to={`/listing/${id}`}>
          <Button variant="default" size="sm" className="bg-primary hover:bg-primary-hover rounded-full">
            View Details
          </Button>
        </Link>
        <Link to={`/listing/${id}`} className="text-sm text-muted-foreground">
          Contact Host
        </Link>
      </CardFooter>
    </Card>
  );
};

export default AccommodationCard;

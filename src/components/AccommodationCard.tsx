import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Wifi, CheckCircle } from "lucide-react";
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
    <Card className="overflow-hidden hover:shadow transition-shadow">
      <div className="relative">
        <div className="h-16 bg-gradient-to-r from-primary/80 to-primary-hover/80 flex items-center px-4">
          <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
            </svg>
          </div>
          <div className="text-white">
            <h3 className="font-semibold text-lg leading-tight">{propertyName}</h3>
            <p className="text-sm text-white/90">{type} • {city}</p>
          </div>
        </div>
        {nsfasAccredited && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            NSFAS
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{propertyName}</h3>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{city}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{genderPolicy}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{university}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">R{monthlyCost.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">per month</p>
        </div>
        <Link to={`/listing/${id}`}>
          <Button variant="default" size="sm" className="bg-primary hover:bg-primary-hover">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default AccommodationCard;

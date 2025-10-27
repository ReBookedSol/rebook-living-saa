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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={propertyName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {nsfasAccredited && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
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

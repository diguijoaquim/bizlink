import { MapPin, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    category: string;
    description: string;
    location: string;
    image: string;
    avatar: string;
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
    rating: number;
    reviews: number;
    isVerified: boolean;
  };
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Card className="overflow-hidden app-hover bizlink-shadow-soft">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-soft">
        <img 
          src={business.image} 
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {business.isVerified && (
            <Badge className="bg-gradient-primary text-white border-0">
              Verificado
            </Badge>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={business.avatar} 
              alt={business.name}
              className="w-16 h-16 rounded-full border-4 border-background object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{business.name}</h3>
            <Badge variant="secondary" className="mb-2">{business.category}</Badge>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{business.location}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>⭐ {business.rating}</span>
              <span>({business.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {business.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 space-x-2">
          <div className="flex space-x-2">
            {business.phone && (
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {business.whatsapp && (
              <Button variant="outline" size="sm" className="text-green-600">
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            {business.email && (
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            )}
            {business.website && (
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button className="bg-gradient-primary text-white border-0 hover:opacity-90">
            Ver Perfil
          </Button>
        </div>
      </div>
    </Card>
  );
}
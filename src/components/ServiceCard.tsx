import { Heart, Share, MessageCircle, MapPin, Clock, MoreVertical, Edit, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
    business: {
      name: string;
      avatar: string;
      location: string;
      isVerified: boolean;
    };
    category: string;
    tags: string[];
    postedAt: string;
    likes: number;
    isLiked: boolean;
  };
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPromote?: (id: string, promote: boolean) => void;
}

export function ServiceCard({ service, showActions = false, onEdit, onDelete, onPromote }: ServiceCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card className="overflow-hidden app-hover bizlink-shadow-soft cursor-pointer" onClick={handleCardClick}>
      {/* Service Image */}
      <div className="relative">
        <img 
          src={service.image} 
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-secondary text-white border-0">
            {service.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          {showActions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={handleActionClick}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(service.id); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPromote?.(service.id, true); }}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Turbinar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(service.id); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={handleActionClick}
              >
                <Heart className={`h-4 w-4 ${service.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={handleActionClick}
              >
                <Share className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Service Info */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
            {service.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {service.description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{service.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-primary mb-3">
            {service.price}
          </div>
        </div>

        {/* Business Info */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={service.business.avatar} 
                alt={service.business.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {service.business.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {service.business.name}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{service.business.location}</span>
              </div>
            </div>
          </div>

          <Button 
            size="sm" 
            className="bg-gradient-primary text-white border-0 hover:opacity-90"
            onClick={handleActionClick}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Contactar
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{service.postedAt}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {service.likes}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
import { Heart, Share, MessageCircle, MapPin, Clock, MoreVertical, Edit, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toggleLike, getLikesInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: {
    id: string | number;
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
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(service.isLiked);
  const [likesCount, setLikesCount] = useState(service.likes);
  const [loading, setLoading] = useState(false);

  // Load initial like state
  useEffect(() => {
    const loadLikeState = async () => {
      try {
        if (service.id) {
          const likeInfo = await getLikesInfo('service', Number(service.id));
          setIsLiked(likeInfo.is_liked);
          setLikesCount(likeInfo.likes_count);
        }
      } catch (error) {
        console.error('Error loading like state:', error);
      }
    };

    loadLikeState();
  }, [service.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (service.id) {
        const result = await toggleLike('service', Number(service.id));
        
        if ('message' in result) {
          // Like was removed
          setIsLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        } else {
          // Like was added
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir este serviço.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <span 
              className={`flex items-center cursor-pointer hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-3 w-3 mr-1`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              {likesCount}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, Briefcase, Heart, Share2, MessageCircle, MapPin, Phone, Mail, Globe, Star } from "lucide-react";
import { FeedItem, API_BASE_URL } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface FeedItemProps {
  item: FeedItem;
}

export function FeedItemComponent({ item }: FeedItemProps) {
  const navigate = useNavigate();

  const toAbsolute = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const formatTags = (tags: any) => {
    if (!tags) return [];
    if (typeof tags === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      } catch {
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(tags)) {
      // Filter out malformed tags that look like JSON artifacts
      return tags.filter(tag => 
        typeof tag === 'string' && 
        tag.length > 1 && 
        !tag.match(/^[{}"\\,]$/)
      );
    }
    return [];
  };

  if (item.type === 'service') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md border-border bg-card"
        onClick={() => navigate(`/service/${item.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {item.image_url && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={toAbsolute(item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.is_promoted && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Promovido
                    </Badge>
                  )}
                </div>
                <div className="text-lg font-semibold text-primary">
                  {item.price ? `${item.price.toLocaleString('pt-PT')} MT` : 'Preço sob consulta'}
                </div>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                {item.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
              
              {formatTags(item.tags).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formatTags(item.tags).slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {item.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {item.leads || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'company') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md border-border bg-card"
        onClick={() => navigate(`/profile?company_id=${item.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {item.logo_url && (
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={toAbsolute(item.logo_url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">Empresa</Badge>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">
                {item.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                {item.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.address}, {item.district}, {item.province}</span>
                  </div>
                )}
                {item.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{item.email}</span>
                  </div>
                )}
                {item.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{item.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'user') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md border-border bg-card"
        onClick={() => navigate(`/profile?user_id=${item.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
              {item.profile_photo_url ? (
                <img
                  src={toAbsolute(item.profile_photo_url)}
                  alt={item.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">Utilizador</Badge>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">
                {item.full_name}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {item.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'portfolio') {
    return (
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-md border-border bg-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {item.media_url && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={toAbsolute(item.media_url)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">Portfolio</Badge>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">
                {item.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
              
              {item.link && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Globe className="h-3 w-3" />
                  <span className="truncate">{item.link}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
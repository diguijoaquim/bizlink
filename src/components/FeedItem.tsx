import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, Briefcase, Heart, Share2, MessageCircle, MapPin, Phone, Mail, Globe, Star, MoreHorizontal, Bookmark, Send } from "lucide-react";
import { FeedItem, API_BASE_URL, toggleLike, getLikesInfo } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface FeedItemProps {
  item: FeedItem;
}

export function FeedItemComponent({ item }: FeedItemProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || 0);
  const [loading, setLoading] = useState(false);

  const toAbsolute = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const formatTags = (tags: any) => {
    if (!tags) return [];
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      } catch {
        return tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(tags)) {
      return tags.filter(tag => 
        typeof tag === 'string' && 
        tag.length > 1 && 
        !tag.match(/^[{}"\\,]$/)
      );
    }
    return [];
  };

  // Load initial like state
  useEffect(() => {
    const loadLikeState = async () => {
      try {
        const likeableType = item.type === 'service' ? 'service' : 
                           item.type === 'job' ? 'job' : 
                           item.type === 'company' ? 'company' : null;
        
        if (likeableType && item.id) {
          const likeInfo = await getLikesInfo(likeableType, item.id);
          setIsLiked(likeInfo.is_liked);
          setLikesCount(likeInfo.likes_count);
        }
      } catch (error) {
        console.error('Error loading like state:', error);
      }
    };

    loadLikeState();
  }, [item.id, item.type]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;

    // cache the button element before any await (React may pool the event)
    const buttonEl = e.currentTarget as HTMLElement | null;
    
    setLoading(true);
    
    try {
      const likeableType = item.type === 'service' ? 'service' : 
                          item.type === 'job' ? 'job' : 
                          item.type === 'company' ? 'company' : null;
      
      if (likeableType && item.id) {
        const result = await toggleLike(likeableType, item.id);
        
        if ('message' in result) {
          setIsLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        } else {
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
        
        // Add heart beat animation using cached element
        const heartElement = buttonEl?.querySelector('svg');
        if (heartElement) {
          heartElement.classList.add('animate-heart-beat');
          setTimeout(() => {
            heartElement.classList.remove('animate-heart-beat');
          }, 600);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir este item.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar compartilhamento
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar comentários
  };

  if (item.type === 'service') {
    return (
      <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              {item.poster_avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={toAbsolute(item.poster_avatar)} alt={item.poster_name || 'Poster'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.poster_name || 'BizLink'}</h4>
                  {item.is_promoted && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
              <div className="text-lg font-bold text-primary">
                  {item.price ? `${item.price.toLocaleString('pt-PT')} MT` : 'Preço sob consulta'}
                </div>
              </div>
              
            <h3 className="font-semibold text-foreground mb-2 text-lg">
                {item.title}
              </h3>
              
            <p className="text-foreground mb-3 leading-relaxed">
                {item.description}
              </p>
              
              {formatTags(item.tags).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formatTags(item.tags).slice(0, 5).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Image */}
          {item.image_url && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={toAbsolute(item.image_url)}
                alt={item.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate(`/service/${item.id}`)}
              />
                </div>
              )}
              
          {/* Actions */}
          <div className="flex items-center justify-between p-4 pt-3">
                <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} ${loading ? 'opacity-50' : ''}`}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`h-5 w-5`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleComment}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleShare}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold">{likesCount} curtidas</span>
              <span>{item.leads || 0} leads</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'job') {
    return (
      <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              {item.poster_avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={toAbsolute(item.poster_avatar)} alt={item.poster_name || 'Poster'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.poster_name || 'Vaga'}</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 pb-3">
            <div className="text-lg font-bold text-foreground mb-1">{item.title}</div>
            {item.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{item.location}</span>
              </div>
            )}
            <p className="text-foreground mb-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          {item.image_url && (
            <div className="w-full h-64 overflow-hidden">
              <img
                src={toAbsolute(item.image_url)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 pt-3">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} ${loading ? 'opacity-50' : ''}`} 
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`h-5 w-5`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleComment}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleShare}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className={`h-8 w-8 ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`} onClick={handleBookmark}>
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold">{likesCount} likes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'company') {
    return (
      <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              {item.logo_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={toAbsolute(item.logo_url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                <Badge variant="secondary" className="text-xs">Empresa</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
              </div>
              
          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-foreground mb-3 leading-relaxed">
                {item.description}
              </p>
          </div>

          {/* Cover Image */}
          {item.cover_url && (
            <div className="w-full h-64 overflow-hidden">
              <img
                src={toAbsolute(item.cover_url)}
                alt={item.name}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate(`/profile/${(item as any).username || (item as any).name?.toLowerCase()?.replace(/[^a-z0-9]+/g, '_') || item.id}`)}
              />
            </div>
          )}

          {/* Company Info */}
          <div className="px-4 py-3 space-y-2">
                {item.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                    <span>{item.address}, {item.district}, {item.province}</span>
                  </div>
                )}
                {item.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                    <span>{item.email}</span>
                  </div>
                )}
                {item.website && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Globe className="h-4 w-4" />
                    <span className="truncate">{item.website}</span>
                  </div>
                )}
              </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} ${loading ? 'opacity-50' : ''}`}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`h-5 w-5`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleComment}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleShare}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'user') {
    return (
      <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {item.profile_photo_url ? (
                <img
                  src={toAbsolute(item.profile_photo_url)}
                  alt={item.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{item.full_name}</h4>
                <Badge variant="secondary" className="text-xs">Utilizador</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
              </div>
              
          {/* Cover Image */}
          {item.cover_photo_url && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={toAbsolute(item.cover_photo_url)}
                alt={item.full_name}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate(`/profile/${(item as any).username || (item as any).email?.split('@')[0] || item.id}`)}
              />
            </div>
          )}

          {/* User Info */}
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground mb-2">
              {item.email}
            </p>
            {item.gender && (
              <p className="text-sm text-muted-foreground">
                {item.gender}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} ${loading ? 'opacity-50' : ''}`}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`h-5 w-5`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleComment}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleShare}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.type === 'portfolio') {
    return (
      <Card className="w-full border-border bg-card overflow-hidden feed-item shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">Portfolio</h4>
                  <Badge variant="secondary" className="text-xs">Projeto</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
              </div>
              
          {/* Content */}
          <div className="px-4 pb-3">
            <h3 className="font-semibold text-foreground mb-2 text-lg">
                {item.title}
              </h3>
              
            <p className="text-foreground mb-3 leading-relaxed">
                {item.description}
              </p>
              
              {item.link && (
              <div className="flex items-center gap-2 text-sm text-primary mb-3">
                <Globe className="h-4 w-4" />
                  <span className="truncate">{item.link}</span>
                </div>
              )}
          </div>

          {/* Media */}
          {item.media_url && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={toAbsolute(item.media_url)}
                alt={item.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between p-4 pt-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} ${loading ? 'opacity-50' : ''}`}
                onClick={handleLike}
                disabled={loading}
              >
                <Heart className={`h-5 w-5`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleComment}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleShare}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? 'text-blue-500' : 'text-muted-foreground'}`}
              onClick={handleBookmark}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Phone, MessageCircle, Globe, MapPin, Star, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getService, Service, startChatWithServiceRef } from "@/lib/api";

const ServiceDetail = () => {
  const { id, slug } = useParams();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceId = id || slug;
        if (serviceId) {
          const serviceData = await getService(parseInt(serviceId));
          setService(serviceData);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o serviço.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, slug, toast]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isLiked ? "Serviço removido da sua lista de favoritos" : "Serviço adicionado à sua lista de favoritos",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado!",
      description: "O link do serviço foi copiado para a área de transferência.",
    });
  };

  const handleContact = (type: string) => {
    toast({
      title: "Redirecionando...",
      description: `Abrindo ${type} para contato com a empresa.`,
    });
  };

  const handleStartChat = async () => {
    if (!service) return;
    try {
      await startChatWithServiceRef(service, service.company_id);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-64 bg-muted"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Serviço não encontrado</h1>
          <p className="text-muted-foreground mb-4">O serviço que procura não existe ou foi removido.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleLike}>
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Service Image */}
      <div className="relative h-64 md:h-80">
        <img 
          src={service.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'} 
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {service.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title and Price */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{service.title}</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{service.price}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{new Date(service.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarImage src={service.company?.logo_url} />
                <AvatarFallback>{service.company?.name?.[0] || 'S'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-foreground">{service.company?.name || 'Empresa'}</h3>
                  <Badge variant="secondary" className="text-xs">Verificado</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{service.company?.location || 'Moçambique'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <Button 
                className="h-10 bg-gradient-primary text-white border-0 hover:opacity-90"
                onClick={handleStartChat}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversar sobre este serviço
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => handleContact('WhatsApp')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => handleContact('Telefone')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Descrição</h2>
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>
        </div>

        {/* Category and Tags */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Categoria e Tags</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {service.category}
            </Badge>
            {service.tags && typeof service.tags === 'string' && service.tags.split(',').map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag.trim()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Service Image */}
        {service.image_url && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Imagem do Serviço</h2>
            <img 
              src={service.image_url} 
              alt={service.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Contact CTA */}
        <div className="sticky bottom-4 bg-background p-4 -mx-4 border-t">
          <Button 
            className="w-full bg-gradient-primary text-white border-0 hover:opacity-90 h-12"
            onClick={() => handleContact('Solicitar Orçamento')}
          >
            Solicitar Orçamento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
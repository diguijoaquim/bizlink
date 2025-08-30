import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { BusinessCard } from "@/components/BusinessCard";
import { ServiceCard } from "@/components/ServiceCard";
import { search, getServices, Service, Company, SearchResponse, API_BASE_URL } from "@/lib/api";

const categories = [
  "Todos", "Tecnologia", "Alimentação", "Saúde", "Educação", 
  "Serviços", "Construção", "Beleza", "Automóveis", "Consultoria"
];

const locations = ["Todas", "Maputo", "Beira", "Nampula", "Matola", "Quelimane"];

const mockBusinesses = [
  {
    id: "3",
    name: "Clínica Saúde+",
    category: "Saúde",
    description: "Serviços médicos especializados com equipamentos modernos. Consultas gerais, especialistas e exames laboratoriais.",
    location: "Nampula, Moçambique",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
    phone: "+258 26 456789",
    email: "info@clinicasaudemais.mz",
    website: "saudemais.mz",
    whatsapp: "+258 87 456789",
    rating: 4.9,
    reviews: 234,
    isVerified: true,
  },
  {
    id: "4",
    name: "EduFuturo Academia",
    category: "Educação",
    description: "Centro de formação profissional e cursos técnicos. Preparamos jovens para o mercado de trabalho com cursos práticos.",
    location: "Quelimane, Moçambique",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    phone: "+258 24 789123",
    email: "cursos@edufuturo.mz",
    whatsapp: "+258 88 789123",
    rating: 4.7,
    reviews: 156,
    isVerified: true,
  },
  {
    id: "5",
    name: "AutoServiços Premium",
    category: "Automóveis",
    description: "Oficina especializada em manutenção e reparação de veículos. Serviço de qualidade com garantia e peças originais.",
    location: "Matola, Moçambique",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    phone: "+258 21 654321",
    email: "servicos@autopremium.mz",
    whatsapp: "+258 85 654321",
    rating: 4.5,
    reviews: 98,
    isVerified: false,
  },
];


export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Get query from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    } else {
      loadDefaultServices();
    }
  }, []);

  const loadDefaultServices = async () => {
    setLoading(true);
    try {
      const response = await getServices(1, 20);
      setServices(response.services);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (!searchTerm) {
      setSearchResults(null);
      loadDefaultServices();
      return;
    }

    setSearching(true);
    try {
      const response = await search(searchTerm, 20);
      setSearchResults(response);
      setServices([]); // Clear default services when searching
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toAbsolute = (url: string | null) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const transformCompanyToBusiness = (company: Company) => ({
    id: company.id.toString(),
    name: company.name,
    category: "Empresa",
    description: company.description || "Empresa registrada na plataforma",
    location: `${company.district || ""}, ${company.province || "Moçambique"}`.trim(),
    image: toAbsolute(company.cover_url),
    avatar: toAbsolute(company.logo_url),
    phone: "",
    email: company.email || "",
    website: company.website || "",
    whatsapp: company.whatsapp || "",
    rating: 0,
    reviews: 0,
    isVerified: true,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bizlink-animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Explorar Negócios
          </h1>
          <p className="text-muted-foreground">
            Descubra empresas e serviços em toda Moçambique
          </p>
        </div>

        {/* Advanced Search */}
        <div className="space-y-4 bizlink-animate-slide-up">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, categoria ou localização..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 pr-20 h-12 rounded-full border-2 border-border focus:border-primary"
            />
            <Button 
              onClick={() => handleSearch()}
              disabled={searching}
              className="absolute right-2 top-2 h-8 px-4 rounded-lg text-sm"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Category Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Categorias</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-gradient-primary text-white border-0"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Localização</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {locations.map((location) => (
                  <Badge
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap ${
                      selectedLocation === location
                        ? "bg-gradient-secondary text-white border-0"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex items-center justify-between bizlink-animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-sm text-muted-foreground">
            {searchResults ? 
              `${searchResults.total_results} resultados para "${searchResults.query}"` :
              loading ? "Carregando..." : 
              `${services.length} serviços disponíveis`
            }
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>

        {/* Results */}
        {searchResults ? (
          // Search Results
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todos ({searchResults.total_results})
              </TabsTrigger>
              <TabsTrigger value="services">
                Serviços ({searchResults.summary.services_count})
              </TabsTrigger>
              <TabsTrigger value="companies">
                Empresas ({searchResults.summary.companies_count})
              </TabsTrigger>
              <TabsTrigger value="users">
                Pessoas ({searchResults.summary.users_count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {/* Services */}
              {searchResults.results.services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Serviços</h3>
                  <div className="space-y-4">
                    {searchResults.results.services.map((service) => {
                      const transformedService = {
                        id: service.id.toString(),
                        title: service.title,
                        description: service.description,
                        price: service.price,
                        image: toAbsolute(service.image_url),
                        business: {
                          name: "Empresa",
                          avatar: "/placeholder.svg",
                          location: "Moçambique",
                          isVerified: true,
                        },
                        category: service.category,
                        tags: service.tags && typeof service.tags === 'string' ? 
                          service.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                        postedAt: service.created_at ? new Date(service.created_at).toLocaleDateString('pt-PT') : "Hoje",
                        likes: 0,
                        isLiked: false,
                      };
                      return <ServiceCard key={service.id} service={transformedService} />;
                    })}
                  </div>
                </div>
              )}

              {/* Companies */}
              {searchResults.results.companies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Empresas</h3>
                  <div className="space-y-4">
                    {searchResults.results.companies.map((company) => (
                      <BusinessCard key={company.id} business={transformCompanyToBusiness(company)} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              {searchResults.results.services.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.results.services.map((service) => {
                    const transformedService = {
                      id: service.id.toString(),
                      title: service.title,
                      description: service.description,
                      price: service.price,
                      image: toAbsolute(service.image_url),
                      business: {
                        name: "Empresa",
                        avatar: "/placeholder.svg",
                        location: "Moçambique",
                        isVerified: true,
                      },
                      category: service.category,
                      tags: service.tags && typeof service.tags === 'string' ? 
                        service.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                      postedAt: service.created_at ? new Date(service.created_at).toLocaleDateString('pt-PT') : "Hoje",
                      likes: 0,
                      isLiked: false,
                    };
                    return <ServiceCard key={service.id} service={transformedService} />;
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum serviço encontrado.</p>
              )}
            </TabsContent>

            <TabsContent value="companies" className="mt-6">
              {searchResults.results.companies.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.results.companies.map((company) => (
                    <BusinessCard key={company.id} business={transformCompanyToBusiness(company)} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma empresa encontrada.</p>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <p className="text-center text-muted-foreground py-8">
                {searchResults.summary.users_count > 0 ? 
                  "Lista de usuários em desenvolvimento." : 
                  "Nenhum usuário encontrado."
                }
              </p>
            </TabsContent>
          </Tabs>
        ) : (
          // Default Content (No search)
          <div className="space-y-6">
            {/* Businesses Section */}
            <div className="bizlink-animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Empresas Recomendadas
              </h2>
              <div className="space-y-4">
                {mockBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </div>

            {/* Services Section */}
            <div className="bizlink-animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-secondary" />
                Serviços Disponíveis
              </h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => {
                    const transformedService = {
                      id: service.id.toString(),
                      title: service.title,
                      description: service.description,
                      price: service.price,
                      image: toAbsolute(service.image_url),
                      business: {
                        name: "Empresa",
                        avatar: "/placeholder.svg",
                        location: "Moçambique",
                        isVerified: true,
                      },
                      category: service.category,
                      tags: service.tags && typeof service.tags === 'string' ? 
                        service.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                      postedAt: service.created_at ? new Date(service.created_at).toLocaleDateString('pt-PT') : "Hoje",
                      likes: 0,
                      isLiked: false,
                    };
                    return <ServiceCard key={service.id} service={transformedService} />;
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}

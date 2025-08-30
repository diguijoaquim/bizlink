import { useState, useEffect } from "react";
import { Search, Loader2, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { FeedItemComponent } from "@/components/FeedItem";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchFeed, FeedItem, FeedResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<number | undefined>();
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    location: ''
  });

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string, lastIdParam?: number, limit: number = 10) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      console.log('Searching with query:', searchTerm);
      const response = await searchFeed(searchTerm, lastIdParam, limit);
      console.log('Search response:', response);
      
      if (lastIdParam) {
        // Append to existing results
        setFeedItems(prev => [...prev, ...response.items]);
      } else {
        // Replace results
        setFeedItems(response.items);
      }
      
      setHasMore(response.has_more);
      setLastId(response.next_page_info?.last_id);
    } catch (error) {
      console.error('Error searching:', error);
      setFeedItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Update URL params
    setSearchParams({ q: searchQuery.trim() });
    
    // Perform search
    performSearch(searchQuery.trim());
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = async () => {
    if (!hasMore || !lastId || !searchQuery.trim()) return;
    
    await performSearch(searchQuery.trim(), lastId, 10);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      location: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Search Header */}
        <div className="px-4 pt-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {query ? `Resultados para "${query}"` : "Pesquisar"}
            </h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar serviços, empresas, pessoas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-12 pr-20 h-12 text-base rounded-xl border-border focus:border-primary bg-card"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-2 h-8 px-4 rounded-lg text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                <option value="design">Design</option>
                <option value="development">Desenvolvimento</option>
                <option value="marketing">Marketing</option>
                <option value="consulting">Consultoria</option>
                <option value="other">Outros</option>
              </select>
              
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Qualquer preço</option>
                <option value="0-100">Até 100 MT</option>
                <option value="100-500">100 - 500 MT</option>
                <option value="500-1000">500 - 1000 MT</option>
                <option value="1000+">Acima de 1000 MT</option>
              </select>
              
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Qualquer localização</option>
                <option value="maputo">Maputo</option>
                <option value="beira">Beira</option>
                <option value="nampula">Nampula</option>
                <option value="other">Outras</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {query ? `Resultados para "${query}"` : "Resultados da pesquisa"}
                </h2>
                {feedItems.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {feedItems.length} resultado{feedItems.length !== 1 ? 's' : ''} encontrado{feedItems.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              {query && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="text-sm text-primary"
                >
                  Voltar ao Feed
                </Button>
              )}
            </div>
            
            {/* Results */}
            {loading && feedItems.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Pesquisando...</p>
                </div>
              </div>
            ) : feedItems.length > 0 ? (
              <div className="space-y-4">
                {feedItems.map((item) => (
                  <FeedItemComponent key={`${item.type}-${item.id}`} item={item} />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center py-6">
                    <Button 
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        "Carregar mais resultados"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não encontramos resultados para "{query}". Tente usar termos diferentes ou verificar a ortografia.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar pesquisa
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                  >
                    Voltar ao Feed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Comece a pesquisar
                </h3>
                <p className="text-muted-foreground">
                  Digite algo na barra de pesquisa acima para encontrar serviços, empresas ou pessoas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}

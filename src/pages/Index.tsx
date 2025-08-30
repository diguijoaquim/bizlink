import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { FeedItemComponent } from "@/components/FeedItem";
import { useNavigate } from "react-router-dom";
import { getFeed, searchFeed, FeedItem, FeedResponse } from "@/lib/api";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<number | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        console.log('Loading feed...');
        const response = await getFeed(undefined, 10);
        console.log('Feed loaded successfully:', response);
        console.log('Feed items count:', response.items.length);
        setFeedItems(response.items);
        setHasMore(response.has_more);
        setLastId(response.next_page_info?.last_id);
      } catch (error) {
        console.error('Error loading feed:', error);
        // Set empty items if API fails
        setFeedItems([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadFeed(); 
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, reload normal feed
      setLoading(true);
      try {
        console.log('Reloading normal feed...');
        const response = await getFeed(undefined, 10);
        setFeedItems(response.items);
        setHasMore(response.has_more);
        setLastId(response.next_page_info?.last_id);
      } catch (error) {
        console.error('Error loading feed:', error);
        setFeedItems([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Redirect to search page with query
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = async () => {
    if (!hasMore || !lastId) return;
    
    setLoading(true);
    try {
      console.log('Loading more feed items...');
      const response = await getFeed(lastId, 10);
      
      console.log('Load more response:', response);
      console.log('Load more items count:', response.items.length);
      setFeedItems(prev => [...prev, ...response.items]);
      setHasMore(response.has_more);
      setLastId(response.next_page_info?.last_id);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Search Section */}
        <div className="px-4 pt-6 pb-4">
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
              className="absolute right-2 top-2 h-8 px-4 rounded-lg text-sm"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Feed Section */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Feed</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/explore')}
              className="text-sm text-primary"
            >
              Ver todos
            </Button>
          </div>
          
          {loading && feedItems.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : feedItems.length > 0 ? (
            <div className="space-y-3">
              {feedItems.map((item) => (
                <FeedItemComponent key={`${item.type}-${item.id}`} item={item} />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button 
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      "Carregar mais"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum item disponível no momento.</p>
            </div>
          )}
        </div>

        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 md:h-0" />
      </div>
    </AppLayout>
  );
}
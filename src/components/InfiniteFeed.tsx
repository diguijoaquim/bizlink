import { useState, useEffect, useCallback } from 'react';
import { FeedItemComponent } from './FeedItem';
import { FeedSkeletonList } from './FeedSkeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getFeed, type FeedItem, type FeedResponse } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface InfiniteFeedProps {
  initialQuery?: string;
  showSearchAsLink?: boolean; // when true, render compact clickable bar that navigates to /search
}

export function InfiniteFeed({ initialQuery = '', showSearchAsLink = false }: InfiniteFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<number | undefined>();
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response: FeedResponse = await getFeed(lastId, 10);
      // shuffle items for random order
      const shuffled = [...response.items].sort(() => Math.random() - 0.5);
      
      if (response.items.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => [...prev, ...shuffled]);
      setLastId(response.next_page_info?.last_id);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Error loading more items:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastId]);

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
    threshold: 200
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setItems([]);
        setLastId(undefined);
        setHasMore(true);
        
        const response: FeedResponse = await getFeed(undefined, 10);
        const shuffled = [...response.items].sort(() => Math.random() - 0.5);
        setItems(shuffled);
        setLastId(response.next_page_info?.last_id);
        setHasMore(response.has_more);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [query]);

  // Search functionality (used only when not link-mode)
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    // The useEffect above will handle the reload
  };

  if (loading && items.length === 0) {
    return <FeedSkeletonList count={5} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search Bar */}
      <div className="sticky top-16 z-40  px-3 py-2 border-b border-border">
        {showSearchAsLink ? (
          <div
            className="relative h-10 rounded-full bg-muted flex items-center cursor-pointer"
            onClick={() => navigate('/search')}
          >
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="pl-9 pr-3 w-full text-sm text-muted-foreground">Buscar serviços, empresas, pessoas...</span>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar no feed..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-9 pr-3 bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.type}-${item.id}-${index}`}
            ref={index === items.length - 1 ? lastElementRef : null}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <FeedItemComponent item={item} />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && items.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

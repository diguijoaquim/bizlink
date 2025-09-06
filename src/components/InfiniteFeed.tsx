import { useState, useEffect, useCallback } from 'react';
import { FeedItemComponent } from './FeedItem';
import { FeedSkeletonList } from './FeedSkeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getFeed, type FeedItem, type FeedResponse } from '@/lib/api';

interface InfiniteFeedProps {
  initialQuery?: string;
}

export function InfiniteFeed({ initialQuery = '' }: InfiniteFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<number | undefined>();
  const [query, setQuery] = useState(initialQuery);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response: FeedResponse = await getFeed(lastId, 10);
      
      if (response.items.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => [...prev, ...response.items]);
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
        setItems(response.items);
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

  // Search functionality
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b border-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar no feed..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-4 bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Carregando mais...</span>
          </div>
        </div>
      )}

      {/* End of feed */}
      {!hasMore && items.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground text-sm">
            Você chegou ao final do feed! 🎉
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {query ? 'Tente uma pesquisa diferente ou limpe o filtro para ver todos os conteúdos.' : 'Ainda não há conteúdo no feed. Volte mais tarde!'}
          </p>
        </div>
      )}
    </div>
  );
}

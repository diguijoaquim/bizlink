import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef, loadingRef };
}

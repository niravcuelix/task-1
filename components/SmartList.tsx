'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Review, SearchResponse } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SmartListProps {
  initialData: Review[];
}

const ITEM_HEIGHT = 180;
const ITEMS_PER_PAGE = 100;

export function SmartList({ initialData }: SmartListProps) {
  const [items, setItems] = useState<Review[]>(initialData);
  const [total, setTotal] = useState(initialData.length);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pages, setPages] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight } = useVirtualization({
    totalItems: total,
    itemHeight: ITEM_HEIGHT,
    containerRef,
  });


  const controllerRef = useRef<AbortController | null>(null);
  const fetchData = async (query: string, page: number = 1) => {
    // Cancel any ongoing fetch request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    const controller = new AbortController();
    controllerRef.current = controller;
  
    setLoading(true);
    setError(null);
  
    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
  
      const response = await fetch(`/api/search?${params}`, {
        signal: controller.signal,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: SearchResponse = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      // Append or replace items based on the page
      setItems((prevItems) => (page === 1 ? data.items : [...prevItems, ...data.items]));
      setTotal(data.total);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
        setError('Failed to load reviews. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchData = useCallback(
    debounce((query: string, page: number) => {
      fetchData(query, page);
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPages(1); // Reset page to 1 when the query changes
    debouncedFetchData(query, 1); // Trigger the debounced fetch function
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container || loading) return;

      const { scrollHeight, scrollTop, clientHeight } = container;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isBottom) {
        setPages((prev) => prev + 1);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  useEffect(() => {
    if (pages > 1) {
      fetchData(searchQuery, pages);
    }
  }, [pages, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2">
        <Input
          type="search"
          placeholder="Search organizations or reviews..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Scrollable Div for Items */}
      <div
        ref={containerRef}
        className="relative h-[500px] overflow-auto border rounded-lg bg-background scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-100"
        style={{ contain: 'strict' }}
      >
        <div className="flex gap-[30px]">
          {visibleItems.map(({ index, offsetTop }) => {
            const item = items[index];
            if (!item) return null;

            return (
              <Card
                key={item.id}
                className="absolute w-full p-4 border-b"
                style={{
                  height: ITEM_HEIGHT,
                  transform: `translateY(${offsetTop}px)`,
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{item.organization}</h3>

                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-semibold">Phone:</span> {item.phone}
                    </p>

                    <p>
                      <span className="font-semibold">Category:</span> {item.category}
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span> {item.building} {item.street} {item.city} {item.state} {item.country}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  );
}

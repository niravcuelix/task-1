'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseVirtualizationProps {
  totalItems: number;
  itemHeight: number;
  containerRef: RefObject<HTMLElement>;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  offsetTop: number;
}

export function useVirtualization({
  totalItems,
  itemHeight,
  containerRef,
  overscan = 3,
}: UseVirtualizationProps) {
  const [visibleItems, setVisibleItems] = useState<VirtualItem[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );

    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    setVisibleItems(items);
    setTotalHeight(totalItems * itemHeight);
  }, [totalItems, itemHeight, containerRef, overscan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    calculateVisibleItems();
    const handleScroll = () => calculateVisibleItems();
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', calculateVisibleItems);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [calculateVisibleItems, containerRef]);

  return {
    visibleItems,
    totalHeight,
  };
}
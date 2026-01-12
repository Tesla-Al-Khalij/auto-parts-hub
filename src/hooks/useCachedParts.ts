import { useState, useEffect, useCallback } from 'react';
import { Part } from '@/types';
import { mockParts } from '@/data/mockData';

const CACHE_KEY = 'cached_parts';
const CACHE_TIMESTAMP_KEY = 'cached_parts_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  parts: Part[];
  timestamp: number;
}

export function useCachedParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load from cache
  const loadFromCache = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        return {
          parts: JSON.parse(cached),
          timestamp: parseInt(timestamp, 10),
        };
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return null;
  }, []);

  // Save to cache
  const saveToCache = useCallback((data: Part[]) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
      setLastUpdated(new Date(timestamp));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  // Check if cache is expired
  const isCacheExpired = useCallback((timestamp: number) => {
    return Date.now() - timestamp > CACHE_DURATION;
  }, []);

  // Fetch fresh data (simulated with mockParts, replace with API call)
  const fetchFreshData = useCallback(async (): Promise<Part[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, this would be an API call:
    // const response = await fetch('/api/parts');
    // return response.json();
    
    return mockParts;
  }, []);

  // Sync data - try to fetch fresh, fall back to cache
  const syncData = useCallback(async () => {
    setIsLoading(true);
    
    const cachedData = loadFromCache();
    
    if (navigator.onLine) {
      try {
        // Try to fetch fresh data
        const freshParts = await fetchFreshData();
        setParts(freshParts);
        saveToCache(freshParts);
        setIsFromCache(false);
      } catch (error) {
        console.error('Error fetching fresh data:', error);
        // Fall back to cache if fetch fails
        if (cachedData) {
          setParts(cachedData.parts);
          setLastUpdated(new Date(cachedData.timestamp));
          setIsFromCache(true);
        }
      }
    } else {
      // Offline - use cache
      if (cachedData) {
        setParts(cachedData.parts);
        setLastUpdated(new Date(cachedData.timestamp));
        setIsFromCache(true);
      } else {
        // No cache available, use mock data and save it
        setParts(mockParts);
        saveToCache(mockParts);
        setIsFromCache(false);
      }
    }
    
    setIsLoading(false);
  }, [loadFromCache, saveToCache, fetchFreshData]);

  // Initial load
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Listen for online status changes
  useEffect(() => {
    const handleOnline = () => {
      // Sync when coming back online
      syncData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncData]);

  // Force refresh
  const refresh = useCallback(async () => {
    if (navigator.onLine) {
      await syncData();
    }
  }, [syncData]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    setLastUpdated(null);
  }, []);

  return {
    parts,
    isLoading,
    isFromCache,
    lastUpdated,
    refresh,
    clearCache,
  };
}

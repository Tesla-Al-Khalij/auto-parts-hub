import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface TableControlsOptions<T> {
  data: T[];
  initialPageSize?: number;
  initialSortKey?: keyof T;
  initialSortDirection?: SortDirection;
  searchableFields?: (keyof T)[];
}

export interface TableControlsReturn<T> {
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
  
  // Sorting
  sortConfig: SortConfig<T>;
  handleSort: (key: keyof T) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filtered data (before pagination)
  filteredData: T[];
}

export function useTableControls<T extends Record<string, any>>({
  data,
  initialPageSize = 10,
  initialSortKey = null,
  initialSortDirection = 'desc',
  searchableFields = [],
}: TableControlsOptions<T>): TableControlsReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSortKey as keyof T | null,
    direction: initialSortDirection,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sorting
  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery && searchableFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchableFields.some(field => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue, 'ar');
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchableFields, sortConfig]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  // Reset to page 1 when search query changes
  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Reset to page 1 when page size changes
  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handleSetPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex,
    sortConfig,
    handleSort,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    filteredData,
  };
}

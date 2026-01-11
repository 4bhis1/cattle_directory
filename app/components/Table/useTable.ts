import { useState, useMemo } from 'react';

export interface TableState<T> {
  page: number;
  limit: number;
  searchQuery: string;
  sortBy: keyof T | string;
  sortDirection: 'asc' | 'desc';
  groupBy: string;
  filters: Record<string, any>;
}

export interface UseTableProps<T> {
  data?: T[]; // Client-side data
  defaultLimit?: number;
  defaultSortBy?: string;
  filterFn?: (item: T, searchQuery: string, filters: Record<string, any>) => boolean;
  groupFn?: (item: T, groupBy: string) => string;
}

export const useTable = <T extends Record<string, any>>({
  data = [],
  defaultLimit = 10,
  defaultSortBy = 'id',
  filterFn,
  groupFn
}: UseTableProps<T>) => {
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Processing Data (Client-Side)
  const filteredData = useMemo(() => {
    if (!filterFn) return data;
    return data.filter(item => filterFn(item, searchQuery, filters));
  }, [data, filterFn, searchQuery, filters]);

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0; // Fallback
    });
  }, [filteredData, sortBy, sortDirection]);

  // Grouping
  const groupedData = useMemo(() => {
    if (groupBy === 'none' || !groupFn) return null;
    
    const groups: Record<string, T[]> = {};
    sortedData.forEach(item => {
      const key = groupFn(item, groupBy);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sortedData, groupBy, groupFn]);

  // Pagination (Applied after sorting/grouping, but wait - grouping usually implies pagination per group OR pagination of groups?
  // Usually standard tables paginate the FLAT list. If grouped, we show the whole group?
  // Let's paginate the FLAT list for now, or if grouped, maybe we don't paginate?
  const paginatedData = useMemo(() => {
    if(groupBy !== 'none') return sortedData; // Disable pagination for grouped view for simplicity initially
    
    const start = (page - 1) * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit, groupBy]);

  const totalPages = Math.ceil(sortedData.length / limit);

  return {
    // State
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery: handleSearch,
    sortBy,
    setSortBy: handleSort,
    sortDirection,
    setSortDirection,
    groupBy,
    setGroupBy,
    filters,
    setFilter: handleFilterChange,
    clearFilters: handleClearFilters,

    // Data
    data: paginatedData,
    sortedData,
    totalItems: sortedData.length,
    totalPages,
    groupedData,
    
    // Helpers
    isFiltered: searchQuery !== '' || Object.keys(filters).some(k => filters[k] !== '' && filters[k] !== 'all' && filters[k] !== false),
  };
};

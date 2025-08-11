import { MediaItem } from './api';

export interface SearchFilters {
  media_type?: string;
  status?: string;
  genre?: string;
  creator?: string;
  release_year?: string;
}

export type SortField = 'title' | 'creator' | 'release_date' | 'created_at' | 'genre';
export type SortOrder = 'asc' | 'desc';

/**
 * Apply client-side filters to a list of media items
 */
export function applyFilters(items: MediaItem[], filters: SearchFilters): MediaItem[] {
  let filtered = [...items];

  if (filters.genre) {
    filtered = filtered.filter(item => 
      item.genre?.toLowerCase().includes(filters.genre!.toLowerCase())
    );
  }

  if (filters.creator) {
    filtered = filtered.filter(item =>
      item.creator.toLowerCase().includes(filters.creator!.toLowerCase())
    );
  }

  if (filters.release_year) {
    filtered = filtered.filter(item =>
      item.release_date?.includes(filters.release_year!)
    );
  }

  return filtered;
}

/**
 * Sort media items by specified field and order
 */
export function sortItems(items: MediaItem[], sortBy: SortField, order: SortOrder): MediaItem[] {
  return [...items].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'creator':
        aValue = a.creator.toLowerCase();
        bValue = b.creator.toLowerCase();
        break;
      case 'release_date':
        aValue = a.release_date || '';
        bValue = b.release_date || '';
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'genre':
        aValue = a.genre?.toLowerCase() || '';
        bValue = b.genre?.toLowerCase() || '';
        break;
    }

    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

/**
 * Perform a fuzzy search on media items
 */
export function fuzzySearch(items: MediaItem[], query: string): MediaItem[] {
  if (!query.trim()) return items;

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return items.filter(item => {
    const searchableText = [
      item.title,
      item.creator,
      item.genre || '',
      item.description || '',
      item.media_type
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Extract unique values from a field across all items
 */
export function extractUniqueValues(items: MediaItem[], field: keyof MediaItem): string[] {
  const values = new Set<string>();
  
  items.forEach(item => {
    const value = item[field];
    if (value && typeof value === 'string') {
      values.add(value);
    }
  });
  
  return Array.from(values).sort();
}

/**
 * Get popular genres from items (sorted by frequency)
 */
export function getPopularGenres(items: MediaItem[], limit: number = 10): string[] {
  const genreCounts: Record<string, number> = {};
  
  items.forEach(item => {
    if (item.genre) {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
    }
  });
  
  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([genre]) => genre);
}

/**
 * Get popular creators from items (sorted by frequency)
 */
export function getPopularCreators(items: MediaItem[], limit: number = 10): string[] {
  const creatorCounts: Record<string, number> = {};
  
  items.forEach(item => {
    creatorCounts[item.creator] = (creatorCounts[item.creator] || 0) + 1;
  });
  
  return Object.entries(creatorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([creator]) => creator);
}

/**
 * Build search URL with parameters
 */
export function buildSearchUrl(query: string, filters: SearchFilters, sortBy?: SortField, order?: SortOrder): string {
  const params = new URLSearchParams();
  
  if (query.trim()) params.set('q', query);
  if (filters.media_type && filters.media_type !== 'all') params.set('type', filters.media_type);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.creator) params.set('creator', filters.creator);
  if (filters.release_year) params.set('year', filters.release_year);
  if (sortBy && sortBy !== 'title') params.set('sort', sortBy);
  if (order && order !== 'asc') params.set('order', order);
  
  return `/search${params.toString() ? `?${params.toString()}` : ''}`;
}

/**
 * Parse search URL parameters
 */
export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    query: searchParams.get('q') || '',
    filters: {
      media_type: searchParams.get('type') || 'all',
      status: searchParams.get('status') || 'all',
      genre: searchParams.get('genre') || '',
      creator: searchParams.get('creator') || '',
      release_year: searchParams.get('year') || '',
    },
    sortBy: (searchParams.get('sort') as SortField) || 'title',
    order: (searchParams.get('order') as SortOrder) || 'asc',
  };
}

/**
 * Highlight search terms in text
 */
export function highlightText(text: string, searchTerms: string[]): string {
  if (!searchTerms.length) return text;
  
  let highlightedText = text;
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
} 
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import MediaItemCard from '@/components/MediaItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MediaItem, searchAPI, mediaAPI } from '@/lib/api';
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  SortAsc, 
  SortDesc, 
  Calendar,
  Tag,
  User,
  Film,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState({
    media_type: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'all',
    genre: searchParams.get('genre') || '',
    creator: searchParams.get('creator') || '',
    release_year: searchParams.get('year') || '',
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'asc'
  );

  const [popularGenres, setPopularGenres] = useState<string[]>([]);
  const [popularCreators, setPopularCreators] = useState<string[]>([]);

  useEffect(() => {
    loadPopularFilters();
    
    // If there's a query in URL params, perform search
    if (searchParams.get('q')) {
      performSearch(searchParams.get('q') || '');
    }
  }, []);

  const loadPopularFilters = async () => {
    try {
      const statsResponse = await mediaAPI.getStatistics();
      const stats = statsResponse.data;
      
      // Get top genres
      const topGenres = Object.keys(stats.top_genres).slice(0, 10);
      setPopularGenres(topGenres);
      
      // For creators, we'll need to get some items and extract creators
      const itemsResponse = await mediaAPI.getAll({ limit: 50 });
      const creators = Array.from(new Set(
        itemsResponse.data.map(item => item.creator)
      )).slice(0, 10);
      setPopularCreators(creators);
    } catch (error) {
      console.error('Failed to load popular filters:', error);
    }
  };

  const performSearch = async (query: string = searchQuery) => {
    if (!query.trim() && !hasActiveFilters()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let searchResults: MediaItem[] = [];
      
      if (query.trim()) {
        // Use search API for text search
        const searchFilters: any = { limit: 100 };
        if (filters.media_type !== 'all') searchFilters.media_type = filters.media_type;
        if (filters.status !== 'all') searchFilters.status = filters.status;
        
        const response = await searchAPI.search(query, searchFilters);
        searchResults = response.data;
      } else {
        // Use getAll API for filter-only searches
        const filterParams: any = { limit: 100 };
        if (filters.media_type !== 'all') filterParams.media_type = filters.media_type;
        if (filters.status !== 'all') filterParams.status = filters.status;
        
        const response = await mediaAPI.getAll(filterParams);
        searchResults = response.data;
      }
      
      // Apply additional client-side filters
      let filteredResults = searchResults;
      
      if (filters.genre) {
        filteredResults = filteredResults.filter(item => 
          item.genre?.toLowerCase().includes(filters.genre.toLowerCase())
        );
      }
      
      if (filters.creator) {
        filteredResults = filteredResults.filter(item =>
          item.creator.toLowerCase().includes(filters.creator.toLowerCase())
        );
      }
      
      if (filters.release_year) {
        filteredResults = filteredResults.filter(item =>
          item.release_date?.includes(filters.release_year)
        );
      }
      
      // Apply sorting
      const sortedResults = [...filteredResults].sort((a, b) => {
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
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      setResults(sortedResults);
      
      // Update URL with search parameters
      updateUrl(query);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const updateUrl = (query: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.media_type !== 'all') params.set('type', filters.media_type);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.creator) params.set('creator', filters.creator);
    if (filters.release_year) params.set('year', filters.release_year);
    if (sortBy !== 'title') params.set('sort', sortBy);
    if (sortOrder !== 'asc') params.set('order', sortOrder);
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  const hasActiveFilters = () => {
    return (
      filters.media_type !== 'all' ||
      filters.status !== 'all' ||
      filters.genre ||
      filters.creator ||
      filters.release_year
    );
  };

  const clearAllFilters = () => {
    setFilters({
      media_type: 'all',
      status: 'all',
      genre: '',
      creator: '',
      release_year: '',
    });
    setSortBy('title');
    setSortOrder('asc');
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    router.replace('/search', { scroll: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search when filters change
    setTimeout(() => performSearch(), 100);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await mediaAPI.updateStatus(id, newStatus);
      setResults(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus as any } : item
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await mediaAPI.delete(id);
      setResults(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setTimeout(() => performSearch(), 100);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">
            Find exactly what you're looking for in your media collection
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search titles, creators, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={() => performSearch()}
                disabled={isSearching}
                size="lg"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Media Type */}
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Select
                    value={filters.media_type}
                    onValueChange={(value) => handleFilterChange('media_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="tv_show">TV Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="wishlist">Wishlist</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="currently_in_use">Currently In Use</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Input
                    placeholder="Enter genre..."
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                  />
                  {popularGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {popularGenres.slice(0, 5).map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleFilterChange('genre', genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Creator */}
                <div className="space-y-2">
                  <Label>Creator/Artist</Label>
                  <Input
                    placeholder="Enter creator name..."
                    value={filters.creator}
                    onChange={(e) => handleFilterChange('creator', e.target.value)}
                  />
                  {popularCreators.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {popularCreators.slice(0, 3).map((creator) => (
                        <Badge
                          key={creator}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => handleFilterChange('creator', creator)}
                        >
                          {creator.length > 15 ? `${creator.slice(0, 15)}...` : creator}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Release Year */}
                <div className="space-y-2">
                  <Label>Release Year</Label>
                  <Input
                    placeholder="e.g., 2023"
                    value={filters.release_year}
                    onChange={(e) => handleFilterChange('release_year', e.target.value)}
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="release_date">Release Date</SelectItem>
                      <SelectItem value="created_at">Date Added</SelectItem>
                      <SelectItem value="genre">Genre</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="w-full"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="w-4 h-4 mr-2" />
                        Descending
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            {hasSearched && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </h2>
                    {searchQuery && (
                      <p className="text-muted-foreground">
                        for "{searchQuery}"
                      </p>
                    )}
                  </div>
                  
                  {/* Active Filters */}
                  {hasActiveFilters() && (
                    <div className="flex flex-wrap gap-2">
                      {filters.media_type !== 'all' && (
                        <Badge variant="secondary">
                          <Film className="w-3 h-3 mr-1" />
                          {filters.media_type}
                        </Badge>
                      )}
                      {filters.status !== 'all' && (
                        <Badge variant="secondary">
                          Status: {filters.status.replace('_', ' ')}
                        </Badge>
                      )}
                      {filters.genre && (
                        <Badge variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {filters.genre}
                        </Badge>
                      )}
                      {filters.creator && (
                        <Badge variant="secondary">
                          <User className="w-3 h-3 mr-1" />
                          {filters.creator}
                        </Badge>
                      )}
                      {filters.release_year && (
                        <Badge variant="secondary">
                          <Calendar className="w-3 h-3 mr-1" />
                          {filters.release_year}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {isSearching ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching your collection...</p>
                </div>
              </div>
            ) : hasSearched ? (
              results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((item) => (
                    <MediaItemCard
                      key={item.id}
                      item={item}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start your search</h3>
                <p className="text-muted-foreground mb-6">
                  Enter a search term or use the filters to find specific items in your collection.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => handleFilterChange('status', 'wishlist')}>
                    Show Wishlist
                  </Button>
                  <Button variant="outline" onClick={() => handleFilterChange('media_type', 'movie')}>
                    Browse Movies
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import MediaItemCard from '@/components/MediaItemCard';
import QuickFilters from '@/components/QuickFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaItem, mediaAPI } from '@/lib/api';
import { Library, Filter, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    media_type: 'all',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    has_more: false,
  });

  useEffect(() => {
    loadItems();
  }, [filters, pagination.offset]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      
      const filterParams: any = {
        limit: pagination.limit,
        offset: pagination.offset,
      };
      
      if (filters.media_type && filters.media_type !== 'all') filterParams.media_type = filters.media_type;
      if (filters.status && filters.status !== 'all') filterParams.status = filters.status;
      
      const response = await mediaAPI.getAll(filterParams);
      setItems(response.data);
      
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination!.total,
          has_more: response.pagination!.has_more,
        }));
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType: 'media_type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await mediaAPI.updateStatus(id, newStatus);
      
      // Update the item in the list
      setItems(prev => 
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
      
      // Remove from list
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const clearFilters = () => {
    setFilters({
      media_type: 'all',
      status: 'all',
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const hasActiveFilters = (filters.media_type && filters.media_type !== 'all') || (filters.status && filters.status !== 'all');

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Library</h1>
              <p className="text-muted-foreground">
                Browse and manage your complete media collection
              </p>
            </div>
            <Button asChild>
              <Link href="/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Media
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Quick Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickFilters
              onFilterSelect={handleFilterChange}
              activeFilters={{
                media_type: filters.media_type === 'all' ? undefined : filters.media_type,
                status: filters.status === 'all' ? undefined : filters.status,
              }}
            />
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Media Type</label>
                <Select
                  value={filters.media_type}
                  onValueChange={(value) => handleFilterChange('media_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
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

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
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

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {isLoading && pagination.offset === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your library...</p>
            </div>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1}-{Math.min(pagination.offset + items.length, pagination.total)} of {pagination.total} items
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <MediaItemCard
                  key={item.id}
                  item={item}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.has_more && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? 'No items match your filters' : 'Your library is empty'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters or clear them to see all items.'
                : 'Start building your collection by adding your first media item.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button asChild>
                <Link href="/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Media
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
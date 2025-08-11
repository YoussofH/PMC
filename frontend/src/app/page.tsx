'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import MediaItemCard from '@/components/MediaItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaItem, Statistics, mediaAPI, searchAPI } from '@/lib/api';
import { 
  Library, 
  Plus, 
  Search, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Music, 
  Gamepad2, 
  Film,
  Tv,
  Clock,
  Heart,
  CheckCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  movie: Film,
  music: Music,
  game: Gamepad2,
  book: BookOpen,
  tv_show: Tv,
};

export default function Dashboard() {
  const [recentItems, setRecentItems] = useState<MediaItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load recent items and statistics in parallel
      const [itemsResponse, statsResponse] = await Promise.all([
        mediaAPI.getAll({ limit: 8 }),
        mediaAPI.getStatistics()
      ]);
      
      setRecentItems(itemsResponse.data);
      setStatistics(statsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchAPI.search(query, { limit: 6 });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await mediaAPI.updateStatus(id, newStatus);
      
      // Update the item in both recent items and search results
      setRecentItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus as any } : item
        )
      );
      
      setSearchResults(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus as any } : item
        )
      );
      
      // Refresh statistics
      const statsResponse = await mediaAPI.getStatistics();
      setStatistics(statsResponse.data);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await mediaAPI.delete(id);
      
      // Remove from both lists
      setRecentItems(prev => prev.filter(item => item.id !== id));
      setSearchResults(prev => prev.filter(item => item.id !== id));
      
      // Refresh statistics
      const statsResponse = await mediaAPI.getStatistics();
      setStatistics(statsResponse.data);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const statusIcons = {
    owned: CheckCircle,
    wishlist: Heart,
    currently_in_use: Eye,
    completed: CheckCircle,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your collection...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your personal media collection
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/add">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Media</h3>
                  <p className="text-sm text-muted-foreground">Add new items to your collection</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/library">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <Library className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Library</h3>
                  <p className="text-sm text-muted-foreground">Explore your full collection</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/search">
              <CardContent className="flex items-center p-6">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Search</h3>
                  <p className="text-sm text-muted-foreground">Find specific items quickly</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Search */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Quick Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search your collection..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full"
                />
                
                {isSearching && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((item) => (
                      <MediaItemCard
                        key={item.id}
                        item={item}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No items found for "{searchQuery}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Collection Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statistics ? (
                  <>
                    <div className="text-center pb-4 border-b">
                      <div className="text-3xl font-bold text-primary">{statistics.total_items}</div>
                      <div className="text-sm text-muted-foreground">Total Items</div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">By Media Type</h4>
                      {Object.entries(statistics.by_media_type).map(([type, count]) => {
                        const Icon = iconMap[type as keyof typeof iconMap] || BookOpen;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="text-sm capitalize">
                                {type.replace('_', ' ')}
                              </span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">By Status</h4>
                      {Object.entries(statistics.by_status).map(([status, count]) => {
                        const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="text-sm capitalize">
                                {status.replace('_', ' ')}
                              </span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>

                    {Object.keys(statistics.top_genres).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Top Genres</h4>
                        {Object.entries(statistics.top_genres).slice(0, 5).map(([genre, count]) => (
                          <div key={genre} className="flex items-center justify-between">
                            <span className="text-sm">{genre}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No statistics available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Items
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/library">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentItems.map((item) => (
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
                    <Library className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your collection by adding your first media item
                    </p>
                    <Button asChild>
                      <Link href="/add">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Item
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

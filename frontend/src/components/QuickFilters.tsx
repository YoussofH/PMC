'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  Music, 
  Gamepad2, 
  BookOpen, 
  Tv, 
  Heart, 
  Eye, 
  CheckCircle,
  ShoppingCart
} from 'lucide-react';

interface QuickFiltersProps {
  onFilterSelect: (type: 'media_type' | 'status', value: string) => void;
  activeFilters: {
    media_type?: string;
    status?: string;
  };
}

const mediaTypeFilters = [
  { value: 'movie', label: 'Movies', icon: Film, color: 'bg-red-100 text-red-800' },
  { value: 'music', label: 'Music', icon: Music, color: 'bg-pink-100 text-pink-800' },
  { value: 'game', label: 'Games', icon: Gamepad2, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'book', label: 'Books', icon: BookOpen, color: 'bg-orange-100 text-orange-800' },
  { value: 'tv_show', label: 'TV Shows', icon: Tv, color: 'bg-cyan-100 text-cyan-800' },
];

const statusFilters = [
  { value: 'wishlist', label: 'Wishlist', icon: Heart, color: 'bg-blue-100 text-blue-800' },
  { value: 'owned', label: 'Owned', icon: ShoppingCart, color: 'bg-green-100 text-green-800' },
  { value: 'currently_in_use', label: 'In Use', icon: Eye, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-purple-100 text-purple-800' },
];

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterSelect, activeFilters }) => {
  return (
    <div className="space-y-4">
      {/* Media Type Filters */}
      <div>
        <h4 className="text-sm font-medium mb-2">Quick Media Type Filters</h4>
        <div className="flex flex-wrap gap-2">
          {mediaTypeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.media_type === filter.value;
            
            return (
              <Button
                key={filter.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterSelect('media_type', isActive ? 'all' : filter.value)}
                className="flex items-center"
              >
                <Icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <h4 className="text-sm font-medium mb-2">Quick Status Filters</h4>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.status === filter.value;
            
            return (
              <Button
                key={filter.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterSelect('status', isActive ? 'all' : filter.value)}
                className="flex items-center"
              >
                <Icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickFilters; 
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaItem, aiAPI } from '@/lib/api';
import { Trash2, Edit, Calendar, User, Sparkles } from 'lucide-react';

interface MediaItemCardProps {
  item: MediaItem;
  onStatusUpdate?: (id: string, newStatus: string) => Promise<void>;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (id: string) => Promise<void>;
  onEnhance?: (id: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  owned: 'bg-green-100 text-green-800 border-green-300',
  wishlist: 'bg-blue-100 text-blue-800 border-blue-300',
  currently_in_use: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completed: 'bg-purple-100 text-purple-800 border-purple-300',
};

const mediaTypeColors: Record<string, string> = {
  movie: 'bg-red-100 text-red-800',
  music: 'bg-pink-100 text-pink-800',
  game: 'bg-indigo-100 text-indigo-800',
  book: 'bg-orange-100 text-orange-800',
  tv_show: 'bg-cyan-100 text-cyan-800',
};

const statusLabels: Record<string, string> = {
  owned: 'Owned',
  wishlist: 'Wishlist',
  currently_in_use: 'In Use',
  completed: 'Completed',
};

const MediaItemCard: React.FC<MediaItemCardProps> = ({
  item,
  onStatusUpdate,
  onEdit,
  onDelete,
  onEnhance,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusUpdate) return;
    
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(item.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsDeleting(true);
      try {
        await onDelete(item.id);
      } catch (error) {
        console.error('Failed to delete item:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEnhance = async () => {
    if (!onEnhance) return;
    
    setIsEnhancing(true);
    try {
      await onEnhance(item.id);
    } catch (error) {
      console.error('Failed to enhance item:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
              {item.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{item.creator}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Badge 
              variant="secondary" 
              className={mediaTypeColors[item.media_type] || 'bg-gray-100 text-gray-800'}
            >
              {item.media_type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <div className="space-y-2">
          {item.genre && (
            <div className="text-sm">
              <span className="font-medium">Genre:</span> <span className="text-muted-foreground">{item.genre}</span>
            </div>
          )}
          
          {item.release_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{item.release_date}</span>
            </div>
          )}
          
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex flex-col gap-3">
        {/* Status */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge 
              variant="outline" 
              className={statusColors[item.status] || 'bg-gray-100 text-gray-800'}
            >
              {statusLabels[item.status] || item.status}
            </Badge>
          </div>
          
          {onStatusUpdate && (
            <Select
              value={item.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wishlist">Wishlist</SelectItem>
                <SelectItem value="owned">Owned</SelectItem>
                <SelectItem value="currently_in_use">Currently In Use</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete || onEnhance) && (
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {onEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex-1 text-blue-600 hover:text-blue-700"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MediaItemCard; 
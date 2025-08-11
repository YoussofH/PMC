import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

// Types matching our backend API
export interface MediaItem {
  id: string;
  title: string;
  creator: string;
  media_type: 'movie' | 'music' | 'game' | 'book' | 'tv_show';
  status: 'owned' | 'wishlist' | 'currently_in_use' | 'completed';
  release_date?: string;
  genre?: string;
  description?: string;
  metadata?: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MediaItemCreate {
  title: string;
  creator: string;
  media_type: 'movie' | 'music' | 'game' | 'book' | 'tv_show';
  status?: 'owned' | 'wishlist' | 'currently_in_use' | 'completed';
  release_date?: string;
  genre?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface MediaItemUpdate {
  title?: string;
  creator?: string;
  media_type?: 'movie' | 'music' | 'game' | 'book' | 'tv_show';
  status?: 'owned' | 'wishlist' | 'currently_in_use' | 'completed';
  release_date?: string;
  genre?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface SearchFilters {
  media_type?: string;
  status?: string;
  limit?: number;
}

export interface GetMediaItemsFilters {
  media_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface Statistics {
  total_items: number;
  by_media_type: Record<string, number>;
  by_status: Record<string, number>;
  top_genres: Record<string, number>;
  total_genres: number;
}

// Media CRUD operations
export const mediaAPI = {
  // Create a new media item
  async create(data: MediaItemCreate): Promise<ApiResponse<MediaItem>> {
    const response = await api.post('/media-items', data);
    return response.data;
  },

  // Get all media items with optional filters
  async getAll(filters?: GetMediaItemsFilters): Promise<ApiResponse<MediaItem[]>> {
    const params = new URLSearchParams();
    if (filters?.media_type) params.append('media_type', filters.media_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get(`/media-items?${params.toString()}`);
    return response.data;
  },

  // Get a specific media item by ID
  async getById(id: string): Promise<ApiResponse<MediaItem>> {
    const response = await api.get(`/media-items/${id}`);
    return response.data;
  },

  // Update a media item
  async update(id: string, data: MediaItemUpdate): Promise<ApiResponse<MediaItem>> {
    const response = await api.put(`/media-items/${id}`, data);
    return response.data;
  },

  // Delete a media item
  async delete(id: string): Promise<ApiResponse<{ deleted_item_id: string }>> {
    const response = await api.delete(`/media-items/${id}`);
    return response.data;
  },

  // Update status of a media item
  async updateStatus(id: string, status: string): Promise<ApiResponse<MediaItem>> {
    const response = await api.patch(`/media-items/${id}/status?new_status=${status}`);
    return response.data;
  },

  // Get items by status
  async getByStatus(status: string, limit?: number): Promise<ApiResponse<MediaItem[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/media-items/status/${status}?${params.toString()}`);
    return response.data;
  },

  // Get statistics
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    const response = await api.get('/media-items/stats');
    return response.data;
  }
};

// Search operations
export const searchAPI = {
  // Search media items
  async search(query: string, filters?: SearchFilters): Promise<ApiResponse<MediaItem[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.media_type) params.append('media_type', filters.media_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/media-items/search?${params.toString()}`);
    return response.data;
  }
};

// System information
export const systemAPI = {
  // Get available media types
  async getMediaTypes(): Promise<{ media_types: string[] }> {
    const response = await api.get('/media-types');
    return response.data;
  },

  // Get available statuses
  async getStatuses(): Promise<{ statuses: string[] }> {
    const response = await api.get('/media-statuses');
    return response.data;
  },

  // Health check
  async health(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  }
};

// AI features placeholder (for future commits)
export const aiAPI = {
  // Will add AI features in later commits
}; 
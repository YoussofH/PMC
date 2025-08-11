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

// AI features
export interface AICategorization {
  suggested_genre: string;
  alternative_genres: string[];
  tags: string[];
  enhanced_description: string;
  release_year_estimate?: string;
  similar_titles: string[];
  content_rating?: string;
  metadata: {
    themes: string[];
    style: string;
    target_audience: string;
  };
}

export interface AIRecommendation {
  title: string;
  creator: string;
  media_type: string;
  genre: string;
  description: string;
  similarity_score: number;
  recommendation_reason: string;
  similar_to: string[];
}

export interface CollectionInsight {
  title: string;
  description: string;
  type: 'preference' | 'trend' | 'achievement' | 'recommendation';
  importance: 'high' | 'medium' | 'low';
}

export interface PersonalityProfile {
  type: string;
  description: string;
  traits: string[];
}

export interface CollectionHealth {
  score: number;
  strengths: string[];
  suggestions: string[];
}

export interface SmartSearchResult {
  interpreted_query: string;
  suggested_filters: {
    media_type?: string;
    status?: string;
    genre?: string;
    creator?: string;
    release_year?: string;
  };
  search_strategy: string;
  explanation: string;
  alternative_queries: string[];
}

export const aiAPI = {
  // Get AI categorization suggestions for a media item
  async categorize(
    title: string, 
    creator: string, 
    media_type: string, 
    description?: string
  ): Promise<{ success: boolean; suggestions?: AICategorization; error?: string }> {
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('creator', creator);
    params.append('media_type', media_type);
    if (description) params.append('description', description);

    const response = await api.post(`/ai/categorize?${params.toString()}`);
    return response.data;
  },

  // Get AI-powered recommendations
  async getRecommendations(limit: number = 5): Promise<{
    success: boolean;
    recommendations?: AIRecommendation[];
    analysis?: any;
    error?: string;
  }> {
    const response = await api.get(`/ai/recommendations?limit=${limit}`);
    return response.data;
  },

  // Get collection insights
  async getCollectionInsights(): Promise<{
    success: boolean;
    insights?: CollectionInsight[];
    personality_profile?: PersonalityProfile;
    collection_health?: CollectionHealth;
    collection_analysis?: any;
    error?: string;
  }> {
    const response = await api.get('/ai/collection-insights');
    return response.data;
  },

  // Smart search interpretation
  async smartSearch(query: string): Promise<{
    success: boolean;
    interpreted_query?: string;
    suggested_filters?: any;
    search_strategy?: string;
    explanation?: string;
    alternative_queries?: string[];
    error?: string;
  }> {
    const params = new URLSearchParams();
    params.append('query', query);

    const response = await api.post(`/ai/smart-search?${params.toString()}`);
    return response.data;
  },

  // Enhance an existing media item with AI
  async enhanceItem(itemId: string): Promise<{
    success: boolean;
    message?: string;
    original_item?: MediaItem;
    updated_item?: MediaItem;
    ai_suggestions?: AICategorization;
    applied_updates?: any;
    error?: string;
  }> {
    const params = new URLSearchParams();
    params.append('item_id', itemId);

    const response = await api.post(`/ai/enhance-item?${params.toString()}`);
    return response.data;
  }
}; 
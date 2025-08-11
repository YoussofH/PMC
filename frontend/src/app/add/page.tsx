'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaItemCreate, mediaAPI, aiAPI, AICategorization } from '@/lib/api';
import { Plus, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddMediaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingAISuggestions, setIsGettingAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AICategorization | null>(null);
  const [formData, setFormData] = useState<MediaItemCreate>({
    title: '',
    creator: '',
    media_type: 'movie',
    status: 'wishlist',
    release_date: '',
    genre: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.creator.trim()) {
      alert('Please fill in the required fields (Title and Creator)');
      return;
    }

    setIsSubmitting(true);
    try {
      await mediaAPI.create(formData);
      router.push('/');
    } catch (error) {
      console.error('Failed to create media item:', error);
      alert('Failed to add media item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MediaItemCreate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAISuggestions = async () => {
    if (!formData.title.trim() || !formData.creator.trim()) {
      alert('Please enter a title and creator first');
      return;
    }

    setIsGettingAISuggestions(true);
    try {
      const result = await aiAPI.categorize(
        formData.title,
        formData.creator,
        formData.media_type,
        formData.description
      );

      if (result.success && result.suggestions) {
        setAiSuggestions(result.suggestions);
      } else {
        alert('Failed to get AI suggestions. Please try again.');
      }
    } catch (error) {
      console.error('AI suggestions failed:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsGettingAISuggestions(false);
    }
  };

  const applyAISuggestion = (field: keyof MediaItemCreate, value: string) => {
    handleInputChange(field, value);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
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
          <h1 className="text-3xl font-bold mb-2">Add New Media</h1>
          <p className="text-muted-foreground">
            Add a new item to your personal media collection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Media Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter the title..."
                  required
                />
              </div>

              {/* Creator */}
              <div className="space-y-2">
                <Label htmlFor="creator">Creator/Artist/Author *</Label>
                <Input
                  id="creator"
                  value={formData.creator}
                  onChange={(e) => handleInputChange('creator', e.target.value)}
                  placeholder="Enter the creator name..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Media Type */}
                <div className="space-y-2">
                  <Label htmlFor="media_type">Media Type *</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value) => handleInputChange('media_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wishlist">Wishlist</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="currently_in_use">Currently In Use</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Release Date */}
                <div className="space-y-2">
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    value={formData.release_date}
                    onChange={(e) => handleInputChange('release_date', e.target.value)}
                    placeholder="e.g., 2023, 2023-05-15"
                  />
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    placeholder="e.g., Action, Rock, RPG..."
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter a brief description..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
              </div>

              {/* AI Suggestions */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">AI Smart Categorization</Label>
                    <p className="text-sm text-muted-foreground">Get intelligent suggestions for genre, description, and more</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getAISuggestions}
                    disabled={isGettingAISuggestions || !formData.title.trim() || !formData.creator.trim()}
                  >
                    {isGettingAISuggestions ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                </div>

                {aiSuggestions && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-900">AI Suggestions</h4>
                    </div>

                    {/* Genre Suggestions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Suggested Genre</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyAISuggestion('genre', aiSuggestions.suggested_genre)}
                          className="bg-white hover:bg-blue-50"
                        >
                          {aiSuggestions.suggested_genre} ⭐
                        </Button>
                        {aiSuggestions.alternative_genres.slice(0, 3).map((genre, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyAISuggestion('genre', genre)}
                            className="bg-white hover:bg-blue-50"
                          >
                            {genre}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Description */}
                    {aiSuggestions.enhanced_description && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Enhanced Description</Label>
                        <div className="bg-white rounded border p-3">
                          <p className="text-sm text-gray-700 mb-2">{aiSuggestions.enhanced_description}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyAISuggestion('description', aiSuggestions.enhanced_description)}
                          >
                            Use This Description
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Release Year */}
                    {aiSuggestions.release_year_estimate && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Estimated Release Year</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => applyAISuggestion('release_date', aiSuggestions.release_year_estimate!)}
                          className="bg-white hover:bg-blue-50"
                        >
                          {aiSuggestions.release_year_estimate}
                        </Button>
                      </div>
                    )}

                    {/* Tags */}
                    {aiSuggestions.tags.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Suggested Tags</Label>
                        <div className="flex flex-wrap gap-1">
                          {aiSuggestions.tags.slice(0, 8).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white border rounded-full text-xs text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar Titles */}
                    {aiSuggestions.similar_titles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Similar Titles</Label>
                        <div className="text-xs text-gray-600">
                          {aiSuggestions.similar_titles.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Collection
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 
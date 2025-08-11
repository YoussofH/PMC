'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import MediaItemCard from '@/components/MediaItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  aiAPI, 
  mediaAPI,
  AIRecommendation, 
  CollectionInsight, 
  PersonalityProfile, 
  CollectionHealth,
  MediaItem 
} from '@/lib/api';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowLeft, 
  Brain, 
  Target, 
  Award,
  Lightbulb,
  RefreshCw,
  Heart,
  Star,
  BarChart3,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function AIInsightsPage() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<CollectionInsight[]>([]);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [collectionHealth, setCollectionHealth] = useState<CollectionHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    try {
      setIsLoading(true);
      
      // Load recommendations and insights in parallel
      const [recommendationsResponse, insightsResponse] = await Promise.all([
        aiAPI.getRecommendations(8),
        aiAPI.getCollectionInsights()
      ]);
      
      if (recommendationsResponse.success && recommendationsResponse.recommendations) {
        setRecommendations(recommendationsResponse.recommendations);
      }
      
      if (insightsResponse.success) {
        if (insightsResponse.insights) setInsights(insightsResponse.insights);
        if (insightsResponse.personality_profile) setPersonalityProfile(insightsResponse.personality_profile);
        if (insightsResponse.collection_health) setCollectionHealth(insightsResponse.collection_health);
      }
      
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = async () => {
    setIsRefreshing(true);
    await loadAIInsights();
    setIsRefreshing(false);
  };

  const addRecommendationToWishlist = async (recommendation: AIRecommendation) => {
    try {
      await mediaAPI.create({
        title: recommendation.title,
        creator: recommendation.creator,
        media_type: recommendation.media_type as any,
        status: 'wishlist',
        genre: recommendation.genre,
        description: recommendation.description,
      });
      
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist. Please try again.');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'preference': return Target;
      case 'trend': return TrendingUp;
      case 'achievement': return Award;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing your collection with AI...</p>
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
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-blue-600" />
                AI Insights
              </h1>
              <p className="text-muted-foreground">
                Discover personalized recommendations and insights about your collection
              </p>
            </div>
            <Button 
              onClick={refreshInsights}
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personality Profile & Collection Health */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personality Profile */}
            {personalityProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Collection Personality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {personalityProfile.type}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {personalityProfile.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Your Traits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {personalityProfile.traits.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collection Health */}
            {collectionHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Collection Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {collectionHealth.score}%
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Health Score</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-1 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {collectionHealth.strengths.slice(0, 3).map((strength, index) => (
                          <li key={index} className="text-sm text-green-700">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1 text-blue-600" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {collectionHealth.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.slice(0, 6).map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getInsightColor(insight.importance)}`}
                      >
                        <div className="flex items-start space-x-2">
                          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <p className="text-xs mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{recommendation.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {recommendation.creator}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {recommendation.media_type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {recommendation.genre}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round(recommendation.similarity_score * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">match</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {recommendation.description}
                        </p>
                        
                        <div className="bg-blue-100 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Why we recommend this:
                          </p>
                          <p className="text-xs text-blue-800">
                            {recommendation.recommendation_reason}
                          </p>
                        </div>
                        
                        {recommendation.similar_to.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Similar to items in your collection:
                            </p>
                            <p className="text-xs text-gray-600">
                              {recommendation.similar_to.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => addRecommendationToWishlist(recommendation)}
                          className="w-full"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Add to Wishlist
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Building Your Recommendations</h3>
                    <p className="text-muted-foreground mb-6">
                      Add more items to your collection to get personalized AI recommendations
                    </p>
                    <Button asChild>
                      <Link href="/add">
                        Add More Media
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
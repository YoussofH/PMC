import os
import json
from typing import Dict, List, Optional, Any
from openai import OpenAI
from models import MediaItem, MediaType, MediaStatus
from database import media_db

class AIService:
    def __init__(self):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY must be set in environment variables")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-3.5-turbo"
    
    async def smart_categorize(self, title: str, creator: str, media_type: str, description: str = "") -> Dict[str, Any]:
        """
        Use AI to suggest genre, tags, and enhanced metadata for a media item
        """
        try:
            prompt = f"""
            You are a media categorization expert. Analyze this {media_type} and provide categorization suggestions.
            
            Title: {title}
            Creator: {creator}
            Description: {description if description else "No description provided"}
            Media Type: {media_type}
            
            Please provide a JSON response with the following structure:
            {{
                "suggested_genre": "Most appropriate genre",
                "alternative_genres": ["alt1", "alt2", "alt3"],
                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
                "enhanced_description": "A brief, informative description if none provided or enhancement of existing",
                "release_year_estimate": "YYYY or null if unknown",
                "similar_titles": ["title1", "title2", "title3"],
                "content_rating": "G/PG/PG-13/R/M/E/T etc. or null",
                "metadata": {{
                    "themes": ["theme1", "theme2"],
                    "style": "style description",
                    "target_audience": "target audience description"
                }}
            }}
            
            Base your suggestions on factual knowledge about this media item if you recognize it.
            For genre, choose the most specific and accurate primary genre.
            For tags, include both factual descriptors and thematic elements.
            Keep descriptions concise but informative.
            """
            
            response = await self._call_openai(prompt)
            
            try:
                ai_suggestions = json.loads(response)
                return {
                    "success": True,
                    "suggestions": ai_suggestions
                }
            except json.JSONDecodeError:
                # Fallback to basic categorization if JSON parsing fails
                return await self._fallback_categorization(title, creator, media_type)
                
        except Exception as e:
            print(f"AI categorization error: {e}")
            return await self._fallback_categorization(title, creator, media_type)
    
    async def get_recommendations(self, user_items: List[Dict[str, Any]], limit: int = 5) -> Dict[str, Any]:
        """
        Generate personalized recommendations based on user's collection
        """
        try:
            if not user_items:
                return {"success": False, "error": "No items in collection for recommendations"}
            
            # Analyze user preferences
            analysis = self._analyze_user_preferences(user_items)
            
            prompt = f"""
            You are a media recommendation expert. Based on this user's collection analysis, suggest new media they might enjoy.
            
            User's Collection Analysis:
            - Favorite Genres: {analysis['top_genres'][:5]}
            - Favorite Creators: {analysis['top_creators'][:3]}
            - Media Type Distribution: {analysis['media_type_distribution']}
            - Recent Interests: {analysis['recent_titles'][:5]}
            - Completion Rate: {analysis['completion_rate']}%
            
            Sample items from their collection:
            {json.dumps(user_items[:10], default=str, indent=2)}
            
            Please provide {limit} personalized recommendations in JSON format:
            {{
                "recommendations": [
                    {{
                        "title": "Recommended Title",
                        "creator": "Creator Name",
                        "media_type": "movie/music/game/book/tv_show",
                        "genre": "Genre",
                        "description": "Why this is recommended for the user",
                        "similarity_score": 0.85,
                        "recommendation_reason": "Specific reason based on their collection",
                        "similar_to": ["item1", "item2"] // from their collection
                    }}
                ]
            }}
            
            Focus on quality recommendations that match their demonstrated preferences.
            Ensure variety while staying within their interest patterns.
            """
            
            response = await self._call_openai(prompt)
            
            try:
                recommendations = json.loads(response)
                return {
                    "success": True,
                    "analysis": analysis,
                    **recommendations
                }
            except json.JSONDecodeError:
                return {"success": False, "error": "Failed to parse AI recommendations"}
                
        except Exception as e:
            print(f"AI recommendations error: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_collection_insights(self, user_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate insights and statistics about the user's collection
        """
        try:
            if not user_items:
                return {"success": False, "error": "No items in collection"}
            
            analysis = self._analyze_user_preferences(user_items)
            
            prompt = f"""
            You are a collection analyst. Provide interesting insights about this media collection.
            
            Collection Statistics:
            - Total Items: {len(user_items)}
            - Media Types: {analysis['media_type_distribution']}
            - Top Genres: {analysis['top_genres'][:10]}
            - Completion Rate: {analysis['completion_rate']}%
            - Average Rating Distribution: {analysis.get('status_distribution', {})}
            
            Sample items:
            {json.dumps(user_items[:15], default=str, indent=2)}
            
            Provide insights in JSON format:
            {{
                "insights": [
                    {{
                        "title": "Insight Title",
                        "description": "Detailed insight description",
                        "type": "preference/trend/achievement/recommendation",
                        "importance": "high/medium/low"
                    }}
                ],
                "personality_profile": {{
                    "type": "Explorer/Completionist/Casual/Enthusiast",
                    "description": "Profile description based on collection patterns",
                    "traits": ["trait1", "trait2", "trait3"]
                }},
                "collection_health": {{
                    "score": 85,
                    "strengths": ["strength1", "strength2"],
                    "suggestions": ["suggestion1", "suggestion2"]
                }}
            }}
            
            Focus on interesting patterns, preferences, and actionable insights.
            """
            
            response = await self._call_openai(prompt)
            
            try:
                insights = json.loads(response)
                return {
                    "success": True,
                    "collection_analysis": analysis,
                    **insights
                }
            except json.JSONDecodeError:
                return {"success": False, "error": "Failed to parse AI insights"}
                
        except Exception as e:
            print(f"AI insights error: {e}")
            return {"success": False, "error": str(e)}
    
    async def smart_search(self, query: str, user_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Enhanced search using natural language understanding
        """
        try:
            prompt = f"""
            You are a smart search assistant for a media collection. Interpret this natural language query and suggest search parameters.
            
            User Query: "{query}"
            
            Available media types: movie, music, game, book, tv_show
            Available statuses: owned, wishlist, currently_in_use, completed
            
            Sample from user's collection:
            {json.dumps(user_items[:5], default=str, indent=2)}
            
            Provide search interpretation in JSON format:
            {{
                "interpreted_query": "Clean search terms",
                "suggested_filters": {{
                    "media_type": "type or null",
                    "status": "status or null",
                    "genre": "genre or null",
                    "creator": "creator or null",
                    "release_year": "year or null"
                }},
                "search_strategy": "exact/fuzzy/related",
                "explanation": "How you interpreted the query",
                "alternative_queries": ["alt1", "alt2"]
            }}
            
            Examples:
            - "sci-fi movies I own" → filters for owned movies with sci-fi genre
            - "games I haven't finished" → filters for owned games not completed
            - "new music to listen to" → filters for wishlist music
            """
            
            response = await self._call_openai(prompt)
            
            try:
                search_interpretation = json.loads(response)
                return {
                    "success": True,
                    **search_interpretation
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "interpreted_query": query,
                    "explanation": "Basic keyword search"
                }
                
        except Exception as e:
            print(f"AI search error: {e}")
            return {
                "success": False,
                "interpreted_query": query,
                "explanation": "Basic keyword search"
            }
    
    async def _call_openai(self, prompt: str) -> str:
        """Make a call to OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides accurate, structured responses in the requested format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API error: {e}")
            raise e
    
    def _analyze_user_preferences(self, user_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze user collection to extract preferences"""
        if not user_items:
            return {}
        
        # Genre analysis
        genres = {}
        for item in user_items:
            genre = item.get('genre', 'Unknown')
            if genre and genre != 'Unknown':
                genres[genre] = genres.get(genre, 0) + 1
        
        # Creator analysis
        creators = {}
        for item in user_items:
            creator = item.get('creator', 'Unknown')
            if creator and creator != 'Unknown':
                creators[creator] = creators.get(creator, 0) + 1
        
        # Media type distribution
        media_types = {}
        for item in user_items:
            media_type = item.get('media_type', 'Unknown')
            media_types[media_type] = media_types.get(media_type, 0) + 1
        
        # Status distribution
        statuses = {}
        for item in user_items:
            status = item.get('status', 'Unknown')
            statuses[status] = statuses.get(status, 0) + 1
        
        # Completion rate
        completed = statuses.get('completed', 0)
        owned = statuses.get('owned', 0)
        completion_rate = (completed / (completed + owned)) * 100 if (completed + owned) > 0 else 0
        
        # Recent additions (by creation date)
        recent_items = sorted(user_items, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
        
        return {
            'top_genres': sorted(genres.items(), key=lambda x: x[1], reverse=True),
            'top_creators': sorted(creators.items(), key=lambda x: x[1], reverse=True),
            'media_type_distribution': media_types,
            'status_distribution': statuses,
            'completion_rate': round(completion_rate, 1),
            'recent_titles': [item.get('title', 'Unknown') for item in recent_items],
            'total_items': len(user_items)
        }
    
    async def _fallback_categorization(self, title: str, creator: str, media_type: str) -> Dict[str, Any]:
        """Fallback categorization when AI fails"""
        # Basic genre suggestions based on media type
        genre_suggestions = {
            'movie': ['Drama', 'Action', 'Comedy', 'Thriller', 'Sci-Fi'],
            'music': ['Pop', 'Rock', 'Hip-Hop', 'Classical', 'Electronic'],
            'game': ['Action', 'RPG', 'Strategy', 'Puzzle', 'Adventure'],
            'book': ['Fiction', 'Non-Fiction', 'Fantasy', 'Mystery', 'Biography'],
            'tv_show': ['Drama', 'Comedy', 'Documentary', 'Reality', 'News']
        }
        
        return {
            "success": True,
            "suggestions": {
                "suggested_genre": genre_suggestions.get(media_type, ['General'])[0],
                "alternative_genres": genre_suggestions.get(media_type, ['General'])[:3],
                "tags": ["popular", media_type, "entertainment"],
                "enhanced_description": f"A {media_type} by {creator}",
                "release_year_estimate": None,
                "similar_titles": [],
                "content_rating": None,
                "metadata": {
                    "themes": ["general"],
                    "style": "unknown",
                    "target_audience": "general"
                }
            }
        }

# Global AI service instance
ai_service = AIService() 
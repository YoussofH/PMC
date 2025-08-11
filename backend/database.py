import os
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Database:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(url, key)
    
    def get_client(self) -> Client:
        return self.supabase

# Global database instance
db = Database()

# Database operations
class MediaItemDB:
    def __init__(self):
        self.client = db.get_client()
        self.table = "media_items"
    
    async def create(self, media_item: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new media item"""
        # Add timestamps
        now = datetime.utcnow().isoformat()
        media_item["created_at"] = now
        media_item["updated_at"] = now
        
        result = self.client.table(self.table).insert(media_item).execute()
        if result.data:
            return result.data[0]
        else:
            raise Exception(f"Failed to create media item: {result}")
    
    async def get_all(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all media items, optionally filtered by user"""
        query = self.client.table(self.table).select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        return result.data or []
    
    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific media item by ID"""
        result = self.client.table(self.table).select("*").eq("id", item_id).execute()
        return result.data[0] if result.data else None
    
    async def update(self, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a media item"""
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        result = self.client.table(self.table).update(updates).eq("id", item_id).execute()
        return result.data[0] if result.data else None
    
    async def delete(self, item_id: str) -> bool:
        """Delete a media item"""
        result = self.client.table(self.table).delete().eq("id", item_id).execute()
        return len(result.data) > 0
    
    async def search(self, query: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search media items by title, creator, or genre"""
        db_query = self.client.table(self.table).select("*")
        
        if user_id:
            db_query = db_query.eq("user_id", user_id)
        
        # Search in title, creator, and genre
        db_query = db_query.or_(f"title.ilike.%{query}%,creator.ilike.%{query}%,genre.ilike.%{query}%")
        
        result = db_query.execute()
        return result.data or []

class CollectionDB:
    def __init__(self):
        self.client = db.get_client()
        self.table = "collections"
    
    async def create(self, collection: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new collection"""
        now = datetime.utcnow().isoformat()
        collection["created_at"] = now
        collection["updated_at"] = now
        
        result = self.client.table(self.table).insert(collection).execute()
        if result.data:
            return result.data[0]
        else:
            raise Exception(f"Failed to create collection: {result}")
    
    async def get_all(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all collections, optionally filtered by user"""
        query = self.client.table(self.table).select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        return result.data or []

class TagDB:
    def __init__(self):
        self.client = db.get_client()
        self.table = "tags"
    
    async def create(self, tag: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new tag"""
        tag["created_at"] = datetime.utcnow().isoformat()
        
        result = self.client.table(self.table).insert(tag).execute()
        if result.data:
            return result.data[0]
        else:
            raise Exception(f"Failed to create tag: {result}")
    
    async def get_all(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all tags, optionally filtered by user"""
        query = self.client.table(self.table).select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        return result.data or []

# Database instances
media_db = MediaItemDB()
collection_db = CollectionDB()
tag_db = TagDB() 
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class MediaType(str, Enum):
    MOVIE = "movie"
    MUSIC = "music"
    GAME = "game"
    BOOK = "book"
    TV_SHOW = "tv_show"

class MediaStatus(str, Enum):
    OWNED = "owned"
    WISHLIST = "wishlist"
    CURRENTLY_IN_USE = "currently_in_use"
    COMPLETED = "completed"

# Database Models (for Supabase)
class MediaItem(BaseModel):
    id: Optional[str] = None
    title: str
    creator: str
    media_type: MediaType
    status: MediaStatus
    release_date: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Collection(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    user_id: Optional[str] = None
    is_public: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Tag(BaseModel):
    id: Optional[str] = None
    name: str
    color: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None

class User(BaseModel):
    id: Optional[str] = None
    email: str
    username: str
    display_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Request/Response Models
class MediaItemCreate(BaseModel):
    title: str
    creator: str
    media_type: MediaType
    status: MediaStatus = MediaStatus.WISHLIST
    release_date: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MediaItemUpdate(BaseModel):
    title: Optional[str] = None
    creator: Optional[str] = None
    media_type: Optional[MediaType] = None
    status: Optional[MediaStatus] = None
    release_date: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class TagCreate(BaseModel):
    name: str
    color: Optional[str] = None 
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uuid
from typing import List, Optional

# Load environment variables
load_dotenv()

# Import our models and database
from models import MediaItem, MediaItemCreate, MediaItemUpdate, MediaType, MediaStatus
from database import media_db, db

app = FastAPI(title="PMC API", description="Personal Media Collection API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def is_valid_uuid(uuid_string: str) -> bool:
    """Check if a string is a valid UUID"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

@app.get("/")
async def root():
    return {"message": "PMC API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/db-test")
async def test_database():
    """Test database connection and return sample data"""
    try:
        # Test basic connection
        items = await media_db.get_all()
        return {
            "status": "database connected",
            "media_items_count": len(items),
            "sample_items": items[:3] if items else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/media-types")
async def get_media_types():
    """Get available media types"""
    return {"media_types": [media_type.value for media_type in MediaType]}

@app.get("/media-statuses") 
async def get_media_statuses():
    """Get available media statuses"""
    return {"statuses": [status.value for status in MediaStatus]}

# MEDIA ITEMS CRUD ENDPOINTS

@app.post("/media-items", response_model=dict)
async def create_media_item(media_item: MediaItemCreate):
    """Create a new media item"""
    try:
        # Convert Pydantic model to dict for database operation
        media_data = media_item.model_dump()
        
        # For now, we'll use a default user_id since auth isn't implemented yet
        # This will be replaced with actual user authentication in later commits
        media_data["user_id"] = "00000000-0000-0000-0000-000000000001"
        
        result = await media_db.create(media_data)
        return {
            "message": "Media item created successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create media item: {str(e)}")

@app.get("/media-items", response_model=dict)
async def get_media_items(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    media_type: Optional[MediaType] = Query(None, description="Filter by media type"),
    status: Optional[MediaStatus] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip")
):
    """Get all media items with optional filtering and pagination"""
    try:
        # Get all items (with user filter if provided)
        items = await media_db.get_all(user_id=user_id or "00000000-0000-0000-0000-000000000001")
        
        # Apply additional filters
        if media_type:
            items = [item for item in items if item.get("media_type") == media_type.value]
        
        if status:
            items = [item for item in items if item.get("status") == status.value]
        
        # Apply pagination
        total_count = len(items)
        paginated_items = items[offset:offset + limit]
        
        return {
            "message": "Media items retrieved successfully",
            "data": paginated_items,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve media items: {str(e)}")

# SEARCH ENDPOINTS

@app.get("/media-items/search", response_model=dict)
async def search_media_items(
    q: str = Query(..., min_length=1, description="Search query for title, creator, or genre"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    media_type: Optional[MediaType] = Query(None, description="Filter by media type"),
    status: Optional[MediaStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results to return")
):
    """Search media items by title, creator, or genre"""
    try:
        # Perform search
        results = await media_db.search(q, user_id=user_id or "00000000-0000-0000-0000-000000000001")
        
        # Apply additional filters
        if media_type:
            results = [item for item in results if item.get("media_type") == media_type.value]
        
        if status:
            results = [item for item in results if item.get("status") == status.value]
        
        # Apply limit
        limited_results = results[:limit]
        
        return {
            "message": f"Search completed for query: '{q}'",
            "data": limited_results,
            "total_results": len(results),
            "search_query": q,
            "applied_filters": {
                "media_type": media_type.value if media_type else None,
                "status": status.value if status else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# STATISTICS ENDPOINTS

@app.get("/media-items/stats", response_model=dict)
async def get_media_statistics(
    user_id: Optional[str] = Query(None, description="Filter by user ID")
):
    """Get statistics about media collection"""
    try:
        items = await media_db.get_all(user_id=user_id or "00000000-0000-0000-0000-000000000001")
        
        # Calculate statistics
        total_items = len(items)
        
        # Count by media type
        type_counts = {}
        for media_type in MediaType:
            type_counts[media_type.value] = len([item for item in items if item.get("media_type") == media_type.value])
        
        # Count by status
        status_counts = {}
        for status in MediaStatus:
            status_counts[status.value] = len([item for item in items if item.get("status") == status.value])
        
        # Count by genre (top 10)
        genre_counts = {}
        for item in items:
            genre = item.get("genre", "Unknown")
            if genre:
                genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        top_genres = dict(sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        
        return {
            "message": "Statistics retrieved successfully",
            "data": {
                "total_items": total_items,
                "by_media_type": type_counts,
                "by_status": status_counts,
                "top_genres": top_genres,
                "total_genres": len(genre_counts)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")

@app.get("/media-items/{item_id}", response_model=dict)
async def get_media_item(item_id: str = Path(..., description="The ID of the media item to retrieve")):
    """Get a specific media item by ID"""
    # Validate UUID format
    if not is_valid_uuid(item_id):
        raise HTTPException(status_code=404, detail="Media item not found")
    
    try:
        item = await media_db.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Media item not found")
        
        return {
            "message": "Media item retrieved successfully",
            "data": item
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve media item: {str(e)}")

@app.put("/media-items/{item_id}", response_model=dict)
async def update_media_item(
    item_id: str = Path(..., description="The ID of the media item to update"),
    updates: MediaItemUpdate = None
):
    """Update a specific media item"""
    # Validate UUID format
    if not is_valid_uuid(item_id):
        raise HTTPException(status_code=404, detail="Media item not found")
    
    try:
        # Check if item exists
        existing_item = await media_db.get_by_id(item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Media item not found")
        
        # Convert updates to dict, excluding None values
        update_data = updates.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields provided for update")
        
        result = await media_db.update(item_id, update_data)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to update media item")
        
        return {
            "message": "Media item updated successfully",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update media item: {str(e)}")

@app.delete("/media-items/{item_id}", response_model=dict)
async def delete_media_item(item_id: str = Path(..., description="The ID of the media item to delete")):
    """Delete a specific media item"""
    # Validate UUID format
    if not is_valid_uuid(item_id):
        raise HTTPException(status_code=404, detail="Media item not found")
    
    try:
        # Check if item exists
        existing_item = await media_db.get_by_id(item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Media item not found")
        
        success = await media_db.delete(item_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete media item")
        
        return {
            "message": "Media item deleted successfully",
            "deleted_item_id": item_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete media item: {str(e)}")

# STATUS TRACKING ENDPOINTS

@app.patch("/media-items/{item_id}/status", response_model=dict)
async def update_media_status(
    item_id: str = Path(..., description="The ID of the media item to update"),
    new_status: MediaStatus = Query(..., description="The new status to set")
):
    """Update the status of a media item (owned, wishlist, currently in use, completed)"""
    # Validate UUID format
    if not is_valid_uuid(item_id):
        raise HTTPException(status_code=404, detail="Media item not found")
    
    try:
        # Check if item exists
        existing_item = await media_db.get_by_id(item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Media item not found")
        
        # Update only the status
        result = await media_db.update(item_id, {"status": new_status.value})
        if not result:
            raise HTTPException(status_code=500, detail="Failed to update media status")
        
        return {
            "message": f"Media status updated to '{new_status.value}' successfully",
            "data": result,
            "previous_status": existing_item.get("status"),
            "new_status": new_status.value
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update media status: {str(e)}")

@app.get("/media-items/status/{status}", response_model=dict)
async def get_media_by_status(
    status: MediaStatus = Path(..., description="The status to filter by"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return")
):
    """Get all media items with a specific status"""
    try:
        items = await media_db.get_all(user_id=user_id or "00000000-0000-0000-0000-000000000001")
        
        # Filter by status
        filtered_items = [item for item in items if item.get("status") == status.value]
        
        # Apply limit
        limited_items = filtered_items[:limit]
        
        return {
            "message": f"Media items with status '{status.value}' retrieved successfully",
            "data": limited_items,
            "total_count": len(filtered_items),
            "status_filter": status.value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve media items by status: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
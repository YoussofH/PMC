from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import List

# Load environment variables
load_dotenv()

# Import our models and database
from models import MediaItem, MediaItemCreate, MediaType, MediaStatus
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
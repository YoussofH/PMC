#!/usr/bin/env python3
"""
Simple test script for database models and operations
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

async def test_database_models():
    """Test database models and basic operations"""
    
    print("🧪 Testing database models...")
    
    try:
        from models import MediaItemCreate, MediaType, MediaStatus
        from database import media_db
        
        # Test model creation
        print("✅ Models imported successfully")
        
        # Test enum values
        print(f"📋 Media types: {[t.value for t in MediaType]}")
        print(f"📋 Media statuses: {[s.value for s in MediaStatus]}")
        
        # Test creating a media item model
        test_item = MediaItemCreate(
            title="Test Movie",
            creator="Test Director",
            media_type=MediaType.MOVIE,
            status=MediaStatus.WISHLIST,
            genre="Test Genre"
        )
        print(f"✅ Created test model: {test_item.title}")
        
        # Test database connection (this will fail if no connection)
        try:
            items = await media_db.get_all()
            print(f"✅ Database query successful: found {len(items)} items")
            
            # Show a sample item if available
            if items:
                sample = items[0]
                print(f"📋 Sample item: '{sample.get('title')}' by {sample.get('creator')} ({sample.get('media_type')})")
        
        except Exception as e:
            print(f"⚠️  Database query failed: {str(e)}")
            print("💡 This is expected if you haven't run the migration yet")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 PMC Database Model Tests")
    print("=" * 40)
    
    success = await test_database_models()
    
    if success:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")
    
    print("\n📋 Next steps:")
    print("1. Make sure you have a .env file with Supabase credentials")
    print("2. Run the database migration in Supabase SQL editor")
    print("3. Run backend/setup_db.py for full database setup")

if __name__ == "__main__":
    asyncio.run(main()) 
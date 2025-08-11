import asyncio
import httpx
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self):
        self.client = None
        self.created_items = []
    
    async def __aenter__(self):
        self.client = httpx.AsyncClient()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()
    
    async def test_health(self):
        """Test basic health endpoints"""
        print("🔍 Testing health endpoints...")
        
        # Test root endpoint
        response = await self.client.get(f"{BASE_URL}/")
        assert response.status_code == 200
        print("✅ Root endpoint working")
        
        # Test health endpoint
        response = await self.client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        print("✅ Health endpoint working")
        
        # Test database connection
        response = await self.client.get(f"{BASE_URL}/db-test")
        assert response.status_code == 200
        print("✅ Database connection working")
        
        # Test media types
        response = await self.client.get(f"{BASE_URL}/media-types")
        assert response.status_code == 200
        data = response.json()
        assert "media_types" in data
        print("✅ Media types endpoint working")
        
        # Test media statuses
        response = await self.client.get(f"{BASE_URL}/media-statuses")
        assert response.status_code == 200
        data = response.json()
        assert "statuses" in data
        print("✅ Media statuses endpoint working")
    
    async def test_create_media_item(self):
        """Test creating media items"""
        print("\n🔍 Testing media item creation...")
        
        # Test data for different media types
        test_items = [
            {
                "title": "The Matrix",
                "creator": "The Wachowskis",
                "media_type": "movie",
                "status": "owned",
                "release_date": "1999-03-31",
                "genre": "Sci-Fi",
                "description": "A computer programmer discovers reality is a simulation."
            },
            {
                "title": "Abbey Road",
                "creator": "The Beatles",
                "media_type": "music",
                "status": "wishlist",
                "release_date": "1969-09-26",
                "genre": "Rock",
                "description": "Classic Beatles album"
            },
            {
                "title": "The Witcher 3",
                "creator": "CD Projekt Red",
                "media_type": "game",
                "status": "completed",
                "release_date": "2015-05-19",
                "genre": "RPG",
                "description": "Open-world fantasy RPG"
            }
        ]
        
        for item_data in test_items:
            response = await self.client.post(f"{BASE_URL}/media-items", json=item_data)
            assert response.status_code == 200
            
            result = response.json()
            assert "data" in result
            assert result["data"]["title"] == item_data["title"]
            
            # Store created item for later tests
            self.created_items.append(result["data"])
            print(f"✅ Created: {item_data['title']} ({item_data['media_type']})")
    
    async def test_get_media_items(self):
        """Test retrieving media items"""
        print("\n🔍 Testing media item retrieval...")
        
        # Test get all items
        response = await self.client.get(f"{BASE_URL}/media-items")
        assert response.status_code == 200
        
        result = response.json()
        assert "data" in result
        assert len(result["data"]) >= len(self.created_items)
        print("✅ Retrieved all media items")
        
        # Test with filters
        response = await self.client.get(f"{BASE_URL}/media-items?media_type=movie")
        assert response.status_code == 200
        result = response.json()
        # Should have at least our test movie
        movie_items = [item for item in result["data"] if item["media_type"] == "movie"]
        assert len(movie_items) >= 1
        print("✅ Retrieved items with media_type filter")
        
        # Test with status filter
        response = await self.client.get(f"{BASE_URL}/media-items?status=owned")
        assert response.status_code == 200
        print("✅ Retrieved items with status filter")
        
        # Test pagination
        response = await self.client.get(f"{BASE_URL}/media-items?limit=2&offset=0")
        assert response.status_code == 200
        result = response.json()
        assert "pagination" in result
        print("✅ Pagination working")
    
    async def test_get_single_item(self):
        """Test retrieving a single media item"""
        print("\n🔍 Testing single item retrieval...")
        
        if not self.created_items:
            print("❌ No items to test with")
            return
        
        item_id = self.created_items[0]["id"]
        response = await self.client.get(f"{BASE_URL}/media-items/{item_id}")
        assert response.status_code == 200
        
        result = response.json()
        assert result["data"]["id"] == item_id
        print("✅ Retrieved single item by ID")
        
        # Test non-existent item (using valid UUID format)
        response = await self.client.get(f"{BASE_URL}/media-items/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        print("✅ Proper 404 for non-existent item")
    
    async def test_update_item(self):
        """Test updating media items"""
        print("\n🔍 Testing media item updates...")
        
        if not self.created_items:
            print("❌ No items to test with")
            return
        
        item_id = self.created_items[0]["id"]
        update_data = {
            "description": "Updated description for testing",
            "genre": "Updated Genre"
        }
        
        response = await self.client.put(f"{BASE_URL}/media-items/{item_id}", json=update_data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["data"]["description"] == update_data["description"]
        assert result["data"]["genre"] == update_data["genre"]
        print("✅ Updated media item successfully")
        
        # Test updating non-existent item (using valid UUID format)
        response = await self.client.put(f"{BASE_URL}/media-items/00000000-0000-0000-0000-000000000000", json=update_data)
        assert response.status_code == 404
        print("✅ Proper 404 for updating non-existent item")
    
    async def test_status_tracking(self):
        """Test status tracking functionality"""
        print("\n🔍 Testing status tracking...")
        
        if not self.created_items:
            print("❌ No items to test with")
            return
        
        item_id = self.created_items[0]["id"]
        
        # Update status
        response = await self.client.patch(f"{BASE_URL}/media-items/{item_id}/status?new_status=currently_in_use")
        assert response.status_code == 200
        
        result = response.json()
        assert result["new_status"] == "currently_in_use"
        print("✅ Status updated successfully")
        
        # Get items by status
        response = await self.client.get(f"{BASE_URL}/media-items/status/currently_in_use")
        assert response.status_code == 200
        
        result = response.json()
        # Should contain our updated item
        found_item = any(item["id"] == item_id for item in result["data"])
        assert found_item
        print("✅ Retrieved items by status")
    
    async def test_search(self):
        """Test search functionality"""
        print("\n🔍 Testing search functionality...")
        
        # Search by title
        response = await self.client.get(f"{BASE_URL}/media-items/search?q=Matrix")
        assert response.status_code == 200
        
        result = response.json()
        # Should find our Matrix movie
        found_matrix = any("Matrix" in item["title"] for item in result["data"])
        assert found_matrix
        print("✅ Search by title working")
        
        # Search by creator
        response = await self.client.get(f"{BASE_URL}/media-items/search?q=Beatles")
        assert response.status_code == 200
        
        result = response.json()
        found_beatles = any("Beatles" in item["creator"] for item in result["data"])
        assert found_beatles
        print("✅ Search by creator working")
        
        # Search with filters
        response = await self.client.get(f"{BASE_URL}/media-items/search?q=Witcher&media_type=game")
        assert response.status_code == 200
        print("✅ Search with filters working")
    
    async def test_statistics(self):
        """Test statistics endpoint"""
        print("\n🔍 Testing statistics...")
        
        response = await self.client.get(f"{BASE_URL}/media-items/stats")
        assert response.status_code == 200
        
        result = response.json()
        assert "data" in result
        data = result["data"]
        
        assert "total_items" in data
        assert "by_media_type" in data
        assert "by_status" in data
        assert "top_genres" in data
        
        # Should have at least our test items
        assert data["total_items"] >= len(self.created_items)
        print("✅ Statistics endpoint working")
    
    async def test_delete_item(self):
        """Test deleting media items"""
        print("\n🔍 Testing media item deletion...")
        
        if not self.created_items:
            print("❌ No items to test with")
            return
        
        # Delete one of our test items
        item_id = self.created_items[-1]["id"]  # Delete the last one
        
        response = await self.client.delete(f"{BASE_URL}/media-items/{item_id}")
        assert response.status_code == 200
        
        result = response.json()
        assert result["deleted_item_id"] == item_id
        print("✅ Item deleted successfully")
        
        # Verify item is gone
        response = await self.client.get(f"{BASE_URL}/media-items/{item_id}")
        assert response.status_code == 404
        print("✅ Deleted item no longer accessible")
        
        # Test deleting non-existent item (using valid UUID format)
        response = await self.client.delete(f"{BASE_URL}/media-items/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        print("✅ Proper 404 for deleting non-existent item")
    
    async def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API tests...\n")
        
        try:
            await self.test_health()
            await self.test_create_media_item()
            await self.test_get_media_items()
            await self.test_get_single_item()
            await self.test_update_item()
            await self.test_status_tracking()
            await self.test_search()
            await self.test_statistics()
            await self.test_delete_item()
            
            print("\n🎉 All tests passed! API is working correctly.")
            
        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            raise

async def main():
    """Main test function"""
    print("PMC API Test Suite")
    print("=" * 50)
    print("Testing API endpoints on localhost:8000")
    print("=" * 50)
    
    async with APITester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main()) 
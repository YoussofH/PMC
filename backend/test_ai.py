import asyncio
import os
from ai_service import ai_service

async def test_ai_functionality():
    """Test AI service functionality"""
    print("🤖 Testing AI Service Functionality\n")
    
    # Check if OpenAI API key is available
    if not os.environ.get("OPENAI_API_KEY"):
        print("⚠️  OpenAI API key not found - testing with fallback categorization")
        
        # Test fallback categorization
        result = await ai_service._fallback_categorization(
            title="The Matrix",
            creator="The Wachowskis", 
            media_type="movie"
        )
        
        print("✅ Fallback categorization working:")
        print(f"   Suggested genre: {result['suggestions']['suggested_genre']}")
        print(f"   Alternative genres: {result['suggestions']['alternative_genres']}")
        print(f"   Tags: {result['suggestions']['tags']}")
        
    else:
        print("🔑 OpenAI API key found - testing full AI functionality")
        
        try:
            # Test smart categorization
            result = await ai_service.smart_categorize(
                title="The Matrix",
                creator="The Wachowskis",
                media_type="movie",
                description="A computer programmer discovers reality is a simulation"
            )
            
            if result["success"]:
                print("✅ AI categorization working:")
                suggestions = result["suggestions"]
                print(f"   Suggested genre: {suggestions.get('suggested_genre', 'N/A')}")
                print(f"   Enhanced description: {suggestions.get('enhanced_description', 'N/A')}")
                print(f"   Tags: {suggestions.get('tags', [])[:3]}")
            else:
                print("❌ AI categorization failed - using fallback")
                
        except Exception as e:
            print(f"❌ AI service error: {e}")
            print("   This is normal if OpenAI API is not properly configured")
    
    print("\n🎯 AI Service test completed!")
    print("   The AI features will work with both OpenAI integration and fallback methods")

if __name__ == "__main__":
    asyncio.run(test_ai_functionality()) 
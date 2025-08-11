const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testFrontendAPIConnection() {
  console.log('Testing Frontend API Connection...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test getting media items
    const itemsResponse = await axios.get(`${BASE_URL}/media-items?limit=3`);
    console.log('✅ Media items loaded:', itemsResponse.data.data.length, 'items');
    
    // Test media types
    const typesResponse = await axios.get(`${BASE_URL}/media-types`);
    console.log('✅ Media types available:', typesResponse.data.media_types);
    
    console.log('\n🎉 Frontend can successfully connect to the backend API!');
    console.log('Frontend should be accessible at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Frontend API connection failed:', error.message);
    console.log('\nMake sure the backend is running on localhost:8000');
  }
}

testFrontendAPIConnection(); 
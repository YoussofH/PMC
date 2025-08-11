import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };

// API endpoints will be added as we build features
export const mediaAPI = {
  // Will add CRUD operations in next commits
};

export const searchAPI = {
  // Will add search functionality
};

export const aiAPI = {
  // Will add AI features
}; 
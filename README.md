# PMC - Personal Media Collection Tracker

A modern, AI-powered personal media collection tracker built with Next.js and FastAPI. Organize your movies, music, games, books, and TV shows with intelligent categorization and insights.

## ✨ Features Overview

### Core Features
- **📱 Media Management**: Add, edit, delete, and organize movies, music, games, books, and TV shows
- **📊 Status Tracking**: Mark items as "owned", "wishlist", "currently in use", or "completed"
- **🔍 Advanced Search**: Find media by title, creator, genre, status, or any metadata
- **🏷️ Smart Filtering**: Quick filters and advanced search with multiple criteria
- **📱 Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile

### AI-Powered Features
- **🤖 Smart Categorization**: Auto-suggest genres and tags when adding new media
- **💡 Collection Insights**: AI-generated analysis of your collection trends and statistics
- **🎯 Personalized Recommendations**: Get suggestions based on your collection patterns
- **🗣️ Natural Language Search**: Search using phrases like "sci-fi movies I own" or "games I haven't finished"
- **✨ Media Enhancement**: AI-powered metadata enrichment for existing items

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful UI components
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **FastAPI** for high-performance Python API
- **PostgreSQL** via Supabase for data storage
- **OpenAI GPT-3.5** for AI features
- **Pydantic** for data validation

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - [Sign up here](https://supabase.com)
2. **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🚀 Quick Start (Simple Setup)

### 1. Get Your API Keys

**Supabase Setup:**
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy your `Project URL` and `anon public` key

**OpenAI Setup:**
1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)


### 2. Add environment variables:
1. `SUPABASE_URL`: Your Supabase project URL
2. `SUPABASE_KEY`: Your Supabase anon key
3. `OPENAI_API_KEY`: Your OpenAI API key

### 3. Setup Database

1. Go to your Supabase project → SQL Editor
2. Run the migration script from `backend/migrations/001_initial_schema.sql`
3. Optionally run `backend/seed_data.sql` for sample data

That's it! Your app should be live and ready to use.

## 🔧 Advanced Setup & Development

### Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your API keys
python setup_db.py  # Setup database
uvicorn main:app --reload
```

**Frontend Setup:**
```bash
cd frontend
npm install
cp env.local.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Local development
# For production: https://your-vercel-app.vercel.app/api
```

### Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User accounts (prepared for future auth)
- **media_items**: Core media data (title, creator, type, status, metadata)
- **collections**: User-created groupings
- **tags**: Flexible labeling system
- **Junction tables**: Many-to-many relationships

See `backend/DATABASE_README.md` for detailed schema documentation.

### API Endpoints

**Core Media Operations:**
- `GET /media-items` - List all media items
- `POST /media-items` - Create new media item
- `PUT /media-items/{id}` - Update media item
- `DELETE /media-items/{id}` - Delete media item
- `GET /search` - Advanced search with filters

**AI Features:**
- `POST /ai/categorize` - Smart categorization for new items
- `GET /ai/recommendations` - Get personalized recommendations
- `GET /ai/collection-insights` - Generate collection analysis
- `POST /ai/smart-search` - Natural language search
- `POST /ai/enhance-item` - AI-enhance existing items

## 🎯 How It Works

### Simple Explanation

PMC is like a smart digital library for all your entertainment. Instead of scattered lists or forgetting what you own, you have one place to:

1. **Add your stuff**: Movies, games, books, music - everything in one place
2. **Track status**: Know what you own, want, are currently using, or have finished
3. **Find things fast**: Search by any detail or use smart filters
4. **Get AI help**: The app suggests genres, gives insights, and helps you discover patterns

### Advanced Technical Flow

#### Architecture Overview
```
User Browser → Next.js Frontend → FastAPI Backend → Supabase PostgreSQL
                     ↓
                OpenAI API (AI Features)
```

#### Data Flow
1. **Frontend** handles UI/UX with React components and TypeScript
2. **API layer** (lib/api.ts) manages all backend communication
3. **Backend** processes requests, validates data, and coordinates services
4. **Database operations** use async Python with Supabase client
5. **AI service** integrates OpenAI for smart features with fallback handling

#### Key Components

**Frontend Architecture:**
- `src/app/`: Next.js App Router pages (dashboard, library, add, search, AI insights)
- `src/components/`: Reusable UI components with shadcn/ui
- `src/lib/`: Utilities for API communication and search logic

**Backend Architecture:**
- `main.py`: FastAPI application with CORS, routes, and error handling
- `models.py`: Pydantic models for data validation and serialization
- `database.py`: Async database operations with connection pooling
- `ai_service.py`: OpenAI integration with intelligent fallbacks

#### AI Integration Details

**Smart Categorization:**
- Uses OpenAI GPT-3.5-turbo to analyze title/creator/description
- Suggests genres, tags, enhanced descriptions, and metadata
- Falls back to rule-based categorization if AI unavailable

**Collection Insights:**
- Analyzes user's complete collection for patterns
- Generates statistics, trends, and personalized observations
- Provides recommendations based on collection gaps

**Natural Language Search:**
- Interprets queries like "sci-fi movies I own" or "games I haven't finished"
- Converts to structured search parameters
- Suggests alternative search terms and strategies

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
pytest test_api.py -v  # API endpoint tests
pytest test_db.py -v   # Database operation tests
pytest test_ai.py -v   # AI service tests
python test_api.py     # Manual API testing
```

**Frontend Tests:**
```bash
cd frontend
node test-frontend.js  # Component and integration tests
```

Built with ❤️ using Next.js, FastAPI, and AI 
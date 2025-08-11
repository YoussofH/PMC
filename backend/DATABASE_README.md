# PMC Database Schema

This document describes the database schema for the Personal Media Collection (PMC) application.

## Overview

The PMC database uses PostgreSQL via Supabase and consists of the following main entities:
- **Users**: User accounts (prepared for future auth)
- **Media Items**: Movies, music, games, books, TV shows
- **Collections**: User-created groupings of media items
- **Tags**: Flexible labeling system
- **Junction Tables**: Many-to-many relationships

## Database Schema

### Core Tables

#### `users`
```sql
- id: UUID (primary key)
- email: VARCHAR(255) (unique)
- username: VARCHAR(100) (unique)  
- display_name: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `media_items`
```sql
- id: UUID (primary key)
- title: VARCHAR(500) (required)
- creator: VARCHAR(500) (required)
- media_type: ENUM ('movie', 'music', 'game', 'book', 'tv_show')
- status: ENUM ('owned', 'wishlist', 'currently_in_use', 'completed')
- release_date: VARCHAR(50)
- genre: VARCHAR(255)
- description: TEXT
- metadata: JSONB (flexible additional data)
- user_id: UUID (foreign key to users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `collections`
```sql
- id: UUID (primary key)
- name: VARCHAR(255) (required)
- description: TEXT
- user_id: UUID (foreign key to users)
- is_public: BOOLEAN (default false)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `tags`
```sql
- id: UUID (primary key)
- name: VARCHAR(100) (required)
- color: VARCHAR(7) (hex color code)
- user_id: UUID (foreign key to users)
- created_at: TIMESTAMP
- UNIQUE(name, user_id)
```

### Junction Tables

#### `collection_items`
Many-to-many relationship between collections and media items.
```sql
- id: UUID (primary key)
- collection_id: UUID (foreign key)
- media_item_id: UUID (foreign key)
- added_at: TIMESTAMP
- UNIQUE(collection_id, media_item_id)
```

#### `media_item_tags`
Many-to-many relationship between media items and tags.
```sql
- id: UUID (primary key)
- media_item_id: UUID (foreign key)
- tag_id: UUID (foreign key)
- created_at: TIMESTAMP
- UNIQUE(media_item_id, tag_id)
```

## Enums

### MediaType
- `movie`: Films and documentaries
- `music`: Albums, songs, soundtracks
- `game`: Video games
- `book`: Books, comics, magazines
- `tv_show`: TV series and episodes

### MediaStatus
- `owned`: User owns this item
- `wishlist`: User wants to acquire this item
- `currently_in_use`: User is currently watching/reading/playing
- `completed`: User has finished this item

## Setup Instructions

### 1. Environment Setup
Copy `env.example` to `.env` and fill in your Supabase credentials:
```bash
cp env.example .env
```

### 2. Database Migration
Run the migration script in your Supabase SQL editor:
```bash
# Copy the contents of migrations/001_initial_schema.sql
# Paste and execute in Supabase SQL Editor
```

### 3. Seed Data (Optional)
Load sample data for testing:
```bash
# Copy the contents of seed_data.sql
# Paste and execute in Supabase SQL Editor
```

### 4. Test Setup
Run the setup script to verify everything is working:
```bash
python setup_db.py
```

Or test just the models:
```bash
python test_db.py
```

## Database Operations

The application includes Python classes for database operations:

- `MediaItemDB`: CRUD operations for media items
- `CollectionDB`: Collection management
- `TagDB`: Tag management

Example usage:
```python
from database import media_db

# Get all media items
items = await media_db.get_all()

# Search media items
results = await media_db.search("matrix")

# Create new media item
item_data = {
    "title": "The Matrix",
    "creator": "The Wachowskis",
    "media_type": "movie",
    "status": "owned"
}
new_item = await media_db.create(item_data)
```

## Indexes

The schema includes optimized indexes for:
- User-based queries
- Search operations (title, creator, genre)
- Status and media type filtering
- Full-text search capabilities

## Security

- All tables include user_id foreign keys for multi-tenant support
- Row Level Security (RLS) should be enabled in Supabase
- UUID primary keys prevent enumeration attacks
- Timestamps track data lifecycle

## Future Extensions

The schema is designed to support:
- User authentication and profiles
- Public collection sharing
- Advanced tagging and categorization
- AI-generated metadata
- Rating and review systems
- Social features (following, recommendations)

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check environment variables
2. **Table Not Found**: Run migration script
3. **Permission Denied**: Check Supabase RLS settings
4. **Import Errors**: Ensure virtual environment is activated

### Debug Commands

```bash
# Test database connection
python -c "from database import db; print(db.get_client().table('users').select('id').limit(1).execute())"

# Check table structure
python setup_db.py

# Test models
python test_db.py
``` 
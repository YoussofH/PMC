#!/usr/bin/env python3
"""
Database setup and migration script for PMC
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Add the backend directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent))

try:
    from database import db
except ImportError:
    print("❌ Error: Could not import database module. Make sure you're in the backend directory and have installed dependencies.")
    sys.exit(1)

def load_sql_file(filename: str) -> str:
    """Load SQL content from a file"""
    file_path = Path(__file__).parent / filename
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Error: Could not find {filename}")
        return ""

def test_connection():
    """Test the database connection"""
    print("🔗 Testing database connection...")
    
    try:
        # Test the connection by running a simple query
        result = db.get_client().table('users').select('id').limit(1).execute()
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\n💡 Make sure you have:")
        print("1. Created a Supabase project")
        print("2. Set SUPABASE_URL and SUPABASE_KEY in your .env file")
        print("3. Enabled RLS (Row Level Security) in your Supabase project settings")
        return False

def run_migration():
    """Run the database migration"""
    print("\n📊 Running database migration...")
    
    migration_sql = load_sql_file("migrations/001_initial_schema.sql")
    if not migration_sql:
        return False
    
    try:
        # Execute the migration SQL
        # Note: We can't use the Supabase client to run DDL directly
        # This would need to be run in the Supabase SQL editor
        print("⚠️  Migration SQL loaded. Please run the following in your Supabase SQL editor:")
        print("=" * 60)
        print(migration_sql[:500] + "..." if len(migration_sql) > 500 else migration_sql)
        print("=" * 60)
        print("📁 Full migration file: backend/migrations/001_initial_schema.sql")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def run_seed_data():
    """Run the seed data"""
    print("\n🌱 Running seed data...")
    
    seed_sql = load_sql_file("seed_data.sql")
    if not seed_sql:
        return False
    
    try:
        print("⚠️  Seed data loaded. Please run the following in your Supabase SQL editor after the migration:")
        print("=" * 60)
        print(seed_sql[:300] + "..." if len(seed_sql) > 300 else seed_sql)
        print("=" * 60)
        print("📁 Full seed file: backend/seed_data.sql")
        return True
    except Exception as e:
        print(f"❌ Seed data failed: {str(e)}")
        return False

def check_tables():
    """Check if tables exist and show their structure"""
    print("\n🔍 Checking database tables...")
    
    tables_to_check = ['users', 'media_items', 'collections', 'tags']
    
    for table in tables_to_check:
        try:
            result = db.get_client().table(table).select('*').limit(1).execute()
            print(f"✅ Table '{table}' exists and is accessible")
        except Exception as e:
            print(f"❌ Table '{table}' issue: {str(e)}")

async def test_operations():
    """Test basic database operations"""
    print("\n🧪 Testing basic database operations...")
    
    try:
        from database import media_db
        
        # Test getting all media items
        items = await media_db.get_all()
        print(f"✅ Found {len(items)} media items in database")
        
        if items:
            print("📋 Sample media items:")
            for item in items[:3]:  # Show first 3 items
                print(f"   - {item.get('title', 'Unknown')} by {item.get('creator', 'Unknown')} ({item.get('media_type', 'Unknown')})")
        
        return True
    except Exception as e:
        print(f"❌ Database operations test failed: {str(e)}")
        return False

def main():
    """Main setup function"""
    print("🚀 PMC Database Setup")
    print("=" * 50)
    
    # Check environment variables
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("💡 Please copy backend/env.example to backend/.env and fill in your values")
        return
    
    # Test connection
    if not test_connection():
        return
    
    # Show migration info
    run_migration()
    
    # Show seed data info
    run_seed_data()
    
    # Check tables (will fail if migration hasn't been run)
    check_tables()
    
    # Test operations (will fail if tables don't exist)
    try:
        asyncio.run(test_operations())
    except Exception as e:
        print(f"⚠️  Could not test operations: {str(e)}")
        print("💡 This is normal if you haven't run the migration yet")
    
    print("\n✅ Database setup complete!")
    print("\n📋 Next steps:")
    print("1. Copy the migration SQL and run it in your Supabase SQL editor")
    print("2. Copy the seed data SQL and run it in your Supabase SQL editor")
    print("3. Run this script again to verify everything is working")

if __name__ == "__main__":
    main() 
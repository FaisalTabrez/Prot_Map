"""
Database Reset Script
=====================
Safely deletes and recreates the database with the new schema.
Run this script when the backend server is STOPPED.

Usage:
    python reset_database.py
"""

import os
import subprocess
import sys

def reset_database():
    db_file = "genes.db"
    
    print("🔄 Database Reset Script")
    print("=" * 60)
    
    # Check if database exists
    if os.path.exists(db_file):
        print(f"📋 Found existing database: {db_file}")
        
        # Try to delete
        try:
            os.remove(db_file)
            print(f"✓ Deleted old database: {db_file}")
        except PermissionError:
            print(f"❌ ERROR: Cannot delete {db_file}")
            print(f"   The file is locked by another process.")
            print(f"   Please stop the backend server (Ctrl+C) and try again.")
            sys.exit(1)
        except Exception as e:
            print(f"❌ ERROR: Failed to delete database: {e}")
            sys.exit(1)
    else:
        print(f"ℹ️  No existing database found (fresh start)")
    
    # Run seed script
    print("\n🌱 Running seed script...")
    print("-" * 60)
    
    try:
        result = subprocess.run(
            [sys.executable, "seed_genes.py"],
            check=True,
            capture_output=False
        )
        print("\n" + "=" * 60)
        print("✅ Database reset complete!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. Start backend: python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        print("   2. Test Deep Dive: Click any gene node in the network")
        print("   3. Watch the sleek sidebar slide in with clinical data!")
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ ERROR: Seed script failed")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()

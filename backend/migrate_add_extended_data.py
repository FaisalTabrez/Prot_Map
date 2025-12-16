"""
Add extended_data column to existing database
==============================================
This migration adds the extended_data column to the genes table
without requiring a database deletion.

Usage:
    python migrate_add_extended_data.py
"""

import sqlite3
import os

def migrate():
    db_file = "genes.db"
    
    if not os.path.exists(db_file):
        print(f"❌ Database file {db_file} not found")
        print(f"   Run: python seed_genes.py")
        return
    
    print("🔄 Adding extended_data column to genes table")
    print("=" * 60)
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(genes)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'extended_data' in columns:
            print("✓ Column 'extended_data' already exists - no migration needed")
            conn.close()
            return
        
        # Add the column
        print("Adding column 'extended_data' (JSON type)...")
        cursor.execute("ALTER TABLE genes ADD COLUMN extended_data JSON")
        conn.commit()
        
        print("✓ Column added successfully")
        
        # Verify
        cursor.execute("PRAGMA table_info(genes)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"✓ Verified - genes table now has {len(columns)} columns: {', '.join(columns)}")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Migration complete!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. Restart backend: python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        print("   2. Test Deep Dive: Click any gene node in the network")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate()

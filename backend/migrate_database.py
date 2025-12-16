"""
Database Migration Script
=========================
Migrates from old schema (Gene.category as string) to new schema (Category table + foreign keys)

This script:
1. Creates the Category table
2. Populates it with initial categories
3. Creates a temporary backup of gene data
4. Drops the old Gene table
5. Recreates Gene table with category_id foreign key
6. Migrates data with proper foreign key relationships
"""

from database import SessionLocal, engine
from sqlalchemy import text, inspect
import sys

def run_migration():
    """Execute database migration"""
    db = SessionLocal()
    
    print("\n" + "="*60)
    print("DATABASE MIGRATION - Schema Upgrade")
    print("="*60)
    
    try:
        # Check if Category table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'categories' in tables:
            print("✓ Category table already exists")
            print("⚠️  Migration may have already been run")
            response = input("\nContinue anyway? This will reset the database (y/N): ")
            if response.lower() != 'y':
                print("❌ Migration cancelled")
                return
        
        print("\n📋 Step 1: Creating backup of existing gene data...")
        
        # Backup existing genes if old schema exists
        if 'genes' in tables:
            result = db.execute(text("SELECT symbol, category, description FROM genes"))
            backup_genes = [(row[0], row[1], row[2]) for row in result]
            print(f"✓ Backed up {len(backup_genes)} genes")
        else:
            backup_genes = []
            print("⚠️  No existing genes table found")
        
        print("\n📋 Step 2: Dropping old tables...")
        db.execute(text("DROP TABLE IF EXISTS genes"))
        db.execute(text("DROP TABLE IF EXISTS categories"))
        db.commit()
        print("✓ Old tables dropped")
        
        print("\n📋 Step 3: Creating new schema with Category table...")
        
        # Import models to create tables
        from models import Base, Category, Gene
        Base.metadata.create_all(bind=engine)
        print("✓ New schema created")
        
        print("\n📋 Step 4: Populating Category table...")
        
        # Create initial categories
        categories_data = [
            {"name": "Tumor Suppressor", "color": "#ff3333"},
            {"name": "Oncogene", "color": "#00ff88"},
            {"name": "Kinase", "color": "#ffaa00"},
            {"name": "Transcription Factor", "color": "#bc13fe"},
            {"name": "Other", "color": "#808080"},
        ]
        
        category_map = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            category_map[cat.name] = cat.id
            print(f"  ✓ Created: {cat.name} (ID: {cat.id})")
        
        db.commit()
        print(f"✓ Created {len(category_map)} categories")
        
        print("\n📋 Step 5: Migrating gene data with foreign keys...")
        
        if backup_genes:
            migrated_count = 0
            for symbol, old_category, description in backup_genes:
                # Map old category to new category_id
                category_id = category_map.get(old_category, category_map.get("Other"))
                
                if category_id:
                    gene = Gene(
                        symbol=symbol,
                        category_id=category_id,
                        description=description
                    )
                    db.add(gene)
                    migrated_count += 1
            
            db.commit()
            print(f"✓ Migrated {migrated_count} genes with foreign key relationships")
        else:
            print("⚠️  No genes to migrate (will seed from scratch)")
        
        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE")
        print("="*60)
        print(f"Categories: {len(category_map)}")
        print(f"Genes: {len(backup_genes) if backup_genes else 'None (run seed_genes.py)'}")
        print("="*60 + "\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ MIGRATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    print("\n⚠️  WARNING: This will modify your database schema")
    print("   Make sure the backend server is stopped before proceeding\n")
    
    response = input("Proceed with migration? (y/N): ")
    if response.lower() == 'y':
        run_migration()
    else:
        print("❌ Migration cancelled")

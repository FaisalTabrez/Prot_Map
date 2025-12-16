"""
Force Database Reset - Closes connections and recreates DB
"""
import os
import sys
import time
import subprocess
import gc

def force_reset():
    db_file = "genes.db"
    
    print("🔄 Force Database Reset")
    print("=" * 60)
    
    # Force garbage collection to release any Python handles
    gc.collect()
    time.sleep(1)
    
    # Try multiple times with delays
    max_attempts = 5
    for attempt in range(1, max_attempts + 1):
        if os.path.exists(db_file):
            try:
                print(f"Attempt {attempt}/{max_attempts}: Deleting {db_file}...")
                os.remove(db_file)
                print(f"✓ Deleted {db_file}")
                break
            except PermissionError:
                if attempt < max_attempts:
                    print(f"   File locked, waiting 2 seconds...")
                    time.sleep(2)
                else:
                    print(f"\n❌ ERROR: Cannot delete {db_file} after {max_attempts} attempts")
                    print(f"   Please manually:")
                    print(f"   1. Close all Python processes")
                    print(f"   2. Delete genes.db")
                    print(f"   3. Run: python seed_genes.py")
                    sys.exit(1)
        else:
            print(f"ℹ️  No existing database found")
            break
    
    # Run seed script
    print("\n🌱 Running seed script...")
    print("-" * 60)
    
    result = subprocess.run([sys.executable, "seed_genes.py"], check=True)
    
    print("\n" + "=" * 60)
    print("✅ Database reset complete!")
    print("=" * 60)

if __name__ == "__main__":
    force_reset()

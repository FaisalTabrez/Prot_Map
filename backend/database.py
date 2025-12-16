"""
Database Configuration for PPI Network Explorer
================================================
SQLAlchemy engine and session setup for gene metadata storage.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Dict

# SQLite database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./genes.db"

# Create SQLAlchemy engine
# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures proper cleanup.
    
    Usage in FastAPI:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# CRUD HELPER FUNCTIONS FOR BATCH OPERATIONS
# ============================================================================

def get_genes_by_symbols(db: Session, symbols: List[str]) -> Dict[str, 'Gene']:
    """
    Retrieve multiple genes from database by their symbols.
    
    Args:
        db: Database session
        symbols: List of gene symbols (case-insensitive)
    
    Returns:
        Dictionary mapping uppercase gene symbols to Gene objects
    
    Example:
        >>> genes = get_genes_by_symbols(db, ['TP53', 'BRCA1'])
        >>> print(genes['TP53'].category)
        'Tumor Suppressor'
    """
    from models import Gene
    
    # Normalize symbols to uppercase for case-insensitive lookup
    normalized_symbols = [s.upper() for s in symbols]
    
    # Query all matching genes in one database call
    genes = db.query(Gene).filter(Gene.symbol.in_(normalized_symbols)).all()
    
    # Build result dictionary
    result = {gene.symbol: gene for gene in genes}
    
    return result


def bulk_create_genes(db: Session, genes_data: List[Dict[str, str]]) -> int:
    """
    Bulk insert multiple genes into the database.
    
    Efficiently adds new genes to the database in a single transaction.
    Used for auto-enrichment when Gemini API provides info for missing genes.
    
    Args:
        db: Database session
        genes_data: List of dictionaries with 'symbol', 'category', 'description' keys
    
    Returns:
        Number of genes successfully inserted
    
    Example:
        >>> new_genes = [
        ...     {"symbol": "TP53", "category": "Tumor Suppressor", "description": "..."},
        ...     {"symbol": "EGFR", "category": "Oncogene", "description": "..."}
        ... ]
        >>> count = bulk_create_genes(db, new_genes)
        >>> print(f"Added {count} genes")
    """
    from models import Gene
    
    try:
        # Create Gene objects
        gene_objects = [
            Gene(
                symbol=data['symbol'].upper(),
                category=data['category'],
                description=data.get('description', '')
            )
            for data in genes_data
        ]
        
        # Add all to session
        db.bulk_save_objects(gene_objects)
        db.commit()
        
        print(f"✓ Bulk inserted {len(gene_objects)} genes into database")
        return len(gene_objects)
    
    except Exception as e:
        db.rollback()
        print(f"❌ Bulk insert failed: {e}")
        return 0


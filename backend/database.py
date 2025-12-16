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
        genes_data: List of dictionaries with 'symbol', 'category_id', 'description' keys
    
    Returns:
        Number of genes successfully inserted
    
    Example:
        >>> new_genes = [
        ...     {"symbol": "TP53", "category_id": 1, "description": "..."},
        ...     {"symbol": "EGFR", "category_id": 2, "description": "..."}
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
                category_id=data['category_id'],
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


# ============================================================================
# CATEGORY MANAGEMENT FUNCTIONS
# ============================================================================

def get_all_categories(db: Session) -> Dict[str, 'Category']:
    """
    Retrieve all categories from database.
    
    Args:
        db: Database session
    
    Returns:
        Dictionary mapping category names to Category objects
    
    Example:
        >>> categories = get_all_categories(db)
        >>> print(categories['Tumor Suppressor'].color)
        '#ff3333'
    """
    from models import Category
    
    categories = db.query(Category).all()
    return {cat.name: cat for cat in categories}


def get_categories_by_names(db: Session, names: List[str]) -> Dict[str, 'Category']:
    """
    Retrieve specific categories by their names.
    
    Args:
        db: Database session
        names: List of category names
    
    Returns:
        Dictionary mapping category names to Category objects
    
    Example:
        >>> cats = get_categories_by_names(db, ['Kinase', 'Ion Channel'])
        >>> print(cats.get('Ion Channel'))  # None if doesn't exist
    """
    from models import Category
    
    categories = db.query(Category).filter(Category.name.in_(names)).all()
    return {cat.name: cat for cat in categories}


def create_category(db: Session, name: str, color: str = "#808080") -> 'Category':
    """
    Create a new category in the database.
    
    Args:
        db: Database session
        name: Category name (e.g., 'Ion Channel')
        color: Hex color code (default: grey)
    
    Returns:
        Created Category object
    
    Example:
        >>> new_cat = create_category(db, 'Ion Channel', '#00bfff')
        >>> print(new_cat.id)
        6
    """
    from models import Category
    
    new_category = Category(name=name, color=color)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    print(f"✓ Created category: {name} ({color})")
    return new_category


def bulk_create_categories(db: Session, categories_data: List[Dict[str, str]]) -> int:
    """
    Bulk insert multiple categories into the database.
    
    Args:
        db: Database session
        categories_data: List of dicts with 'name' and optional 'color' keys
    
    Returns:
        Number of categories successfully inserted
    
    Example:
        >>> new_cats = [
        ...     {"name": "Ion Channel", "color": "#00bfff"},
        ...     {"name": "Cytokine"}  # Uses default grey
        ... ]
        >>> count = bulk_create_categories(db, new_cats)
    """
    from models import Category
    
    try:
        # Create Category objects
        category_objects = [
            Category(
                name=data['name'],
                color=data.get('color', '#808080')
            )
            for data in categories_data
        ]
        
        # Add all to session
        db.bulk_save_objects(category_objects)
        db.commit()
        
        print(f"✓ Bulk inserted {len(category_objects)} categories")
        return len(category_objects)
    
    except Exception as e:
        db.rollback()
        print(f"❌ Category bulk insert failed: {e}")

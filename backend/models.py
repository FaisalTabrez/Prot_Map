"""
Database Models for PPI Network Explorer
=========================================
SQLAlchemy ORM models for gene metadata storage.
"""

from sqlalchemy import Column, Integer, String, Index, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    """
    Gene functional category model.
    
    Stores distinct functional categories that genes can belong to.
    Enables dynamic category management across any disease domain.
    
    Attributes:
        id: Primary key
        name: Category name (e.g., 'Tumor Suppressor', 'Ion Channel') - unique
        color: Hex color code for visualization (default: '#808080' grey)
    """
    __tablename__ = "categories"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Category name - unique and indexed
    name = Column(String, unique=True, index=True, nullable=False)
    
    # Visualization color (hex code)
    color = Column(String, default="#808080", nullable=False)
    
    # Relationship to genes
    genes = relationship("Gene", back_populates="category_ref")
    
    def __repr__(self):
        return f"<Category(name='{self.name}', color='{self.color}')>"


class Gene(Base):
    """
    Gene metadata model.
    
    Stores gene symbols with their biological functional categories.
    Used to annotate network nodes with domain knowledge.
    
    Attributes:
        id: Primary key
        symbol: Gene symbol (e.g., 'TP53', 'BRCA1') - unique and indexed
        category_id: Foreign key to Category table
        category_ref: Relationship to Category object
        description: Optional detailed description of gene function
        extended_data: Cached clinical details from Gemini (JSON)
    """
    __tablename__ = "genes"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Gene symbol - unique and indexed for fast lookups
    symbol = Column(String, unique=True, index=True, nullable=False)
    
    # Foreign key to category
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Relationship to category
    category_ref = relationship("Category", back_populates="genes")
    
    # Optional description
    description = Column(String, nullable=True)
    
    # Extended clinical data (cached from Gemini AI)
    # Structure: {full_name, function_summary, disease_relevance, known_drugs, clinical_significance}
    extended_data = Column(JSON, nullable=True)
    
    def __repr__(self):
        return f"<Gene(symbol='{self.symbol}', category_id={self.category_id})>"

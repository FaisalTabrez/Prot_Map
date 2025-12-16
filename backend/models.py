"""
Database Models for PPI Network Explorer
=========================================
SQLAlchemy ORM models for gene metadata storage.
"""

from sqlalchemy import Column, Integer, String, Index
from database import Base


class Gene(Base):
    """
    Gene metadata model.
    
    Stores gene symbols with their biological functional categories.
    Used to annotate network nodes with domain knowledge.
    
    Attributes:
        id: Primary key
        symbol: Gene symbol (e.g., 'TP53', 'BRCA1') - unique and indexed
        category: Functional category (e.g., 'Tumor Suppressor', 'Oncogene')
        description: Optional detailed description of gene function
    """
    __tablename__ = "genes"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Gene symbol - unique and indexed for fast lookups
    symbol = Column(String, unique=True, index=True, nullable=False)
    
    # Functional category
    # Options: "Tumor Suppressor", "Oncogene", "Kinase", "Transcription Factor", "Other"
    category = Column(String, nullable=False)
    
    # Optional description
    description = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<Gene(symbol='{self.symbol}', category='{self.category}')>"

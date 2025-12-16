"""
Database Seeding Script for Gene Metadata
==========================================
Populates the gene database with common cancer-related genes.

Usage:
    python seed_genes.py
"""

from database import SessionLocal, engine, Base
from models import Gene

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_genes():
    """
    Seed the database with initial gene data.
    Checks for existing entries to avoid duplicates.
    """
    db = SessionLocal()
    
    # Define seed data with categories
    seed_data = [
        # Tumor Suppressors
        {"symbol": "TP53", "category": "Tumor Suppressor", "description": "Guardian of the genome, master tumor suppressor"},
        {"symbol": "BRCA1", "category": "Tumor Suppressor", "description": "DNA repair, hereditary breast/ovarian cancer"},
        {"symbol": "BRCA2", "category": "Tumor Suppressor", "description": "DNA repair, hereditary breast/ovarian cancer"},
        {"symbol": "PTEN", "category": "Tumor Suppressor", "description": "Phosphatase, PI3K/AKT pathway inhibitor"},
        {"symbol": "ATM", "category": "Tumor Suppressor", "description": "DNA damage checkpoint kinase"},
        {"symbol": "RB1", "category": "Tumor Suppressor", "description": "Retinoblastoma protein, cell cycle regulator"},
        {"symbol": "APC", "category": "Tumor Suppressor", "description": "Wnt signaling pathway regulator"},
        {"symbol": "VHL", "category": "Tumor Suppressor", "description": "Von Hippel-Lindau tumor suppressor"},
        {"symbol": "WT1", "category": "Tumor Suppressor", "description": "Wilms tumor suppressor"},
        {"symbol": "MEN1", "category": "Tumor Suppressor", "description": "Multiple endocrine neoplasia type 1"},
        {"symbol": "CHEK2", "category": "Tumor Suppressor", "description": "Checkpoint kinase 2, DNA damage response"},
        {"symbol": "NBN", "category": "Tumor Suppressor", "description": "Nijmegen breakage syndrome protein"},
        {"symbol": "PALB2", "category": "Tumor Suppressor", "description": "BRCA2 partner in DNA repair"},
        {"symbol": "BARD1", "category": "Tumor Suppressor", "description": "BRCA1-associated RING domain protein"},
        {"symbol": "MLH1", "category": "Tumor Suppressor", "description": "DNA mismatch repair"},
        {"symbol": "MSH2", "category": "Tumor Suppressor", "description": "DNA mismatch repair"},
        {"symbol": "MSH6", "category": "Tumor Suppressor", "description": "DNA mismatch repair"},
        {"symbol": "PMS2", "category": "Tumor Suppressor", "description": "DNA mismatch repair"},
        {"symbol": "STK11", "category": "Tumor Suppressor", "description": "Serine/threonine kinase, Peutz-Jeghers syndrome"},
        {"symbol": "SMAD4", "category": "Tumor Suppressor", "description": "TGF-beta signaling pathway"},
        
        # Oncogenes
        {"symbol": "EGFR", "category": "Oncogene", "description": "Epidermal growth factor receptor, tyrosine kinase"},
        {"symbol": "ERBB2", "category": "Oncogene", "description": "HER2, receptor tyrosine kinase, breast cancer"},
        {"symbol": "MYC", "category": "Oncogene", "description": "Master transcription factor, cell proliferation"},
        {"symbol": "KRAS", "category": "Oncogene", "description": "RAS family GTPase, highly mutated in cancer"},
        {"symbol": "HRAS", "category": "Oncogene", "description": "RAS family GTPase"},
        {"symbol": "NRAS", "category": "Oncogene", "description": "RAS family GTPase"},
        {"symbol": "JUN", "category": "Oncogene", "description": "AP-1 transcription factor"},
        {"symbol": "FOS", "category": "Oncogene", "description": "AP-1 transcription factor"},
        {"symbol": "ABL1", "category": "Oncogene", "description": "Tyrosine kinase, BCR-ABL fusion in CML"},
        {"symbol": "BCL2", "category": "Oncogene", "description": "Anti-apoptotic protein"},
        {"symbol": "MET", "category": "Oncogene", "description": "Hepatocyte growth factor receptor"},
        {"symbol": "RET", "category": "Oncogene", "description": "Receptor tyrosine kinase"},
        {"symbol": "ROS1", "category": "Oncogene", "description": "Receptor tyrosine kinase"},
        {"symbol": "FLT3", "category": "Oncogene", "description": "Tyrosine kinase receptor, AML"},
        {"symbol": "KIT", "category": "Oncogene", "description": "Stem cell factor receptor"},
        {"symbol": "PDGFRA", "category": "Oncogene", "description": "Platelet-derived growth factor receptor"},
        
        # Kinases
        {"symbol": "AKT1", "category": "Kinase", "description": "Serine/threonine kinase, PI3K/AKT pathway"},
        {"symbol": "PIK3CA", "category": "Kinase", "description": "PI3-kinase catalytic subunit alpha"},
        {"symbol": "CDK4", "category": "Kinase", "description": "Cyclin-dependent kinase 4, cell cycle"},
        {"symbol": "CDK6", "category": "Kinase", "description": "Cyclin-dependent kinase 6, cell cycle"},
        {"symbol": "BRAF", "category": "Kinase", "description": "Serine/threonine kinase, MAPK pathway"},
        {"symbol": "RAF1", "category": "Kinase", "description": "Serine/threonine kinase, MAPK pathway"},
        {"symbol": "MAP2K1", "category": "Kinase", "description": "MEK1, MAPK pathway"},
        {"symbol": "ALK", "category": "Kinase", "description": "Anaplastic lymphoma kinase"},
        {"symbol": "SRC", "category": "Kinase", "description": "Proto-oncogene tyrosine kinase"},
        {"symbol": "AKT2", "category": "Kinase", "description": "Serine/threonine kinase, PI3K/AKT pathway"},
        {"symbol": "AKT3", "category": "Kinase", "description": "Serine/threonine kinase, PI3K/AKT pathway"},
        {"symbol": "PIK3R1", "category": "Kinase", "description": "PI3-kinase regulatory subunit"},
        {"symbol": "MTOR", "category": "Kinase", "description": "Mechanistic target of rapamycin"},
        {"symbol": "JAK2", "category": "Kinase", "description": "Janus kinase 2"},
        {"symbol": "MAP2K2", "category": "Kinase", "description": "MEK2, MAPK pathway"},
        
        # Transcription Factors
        {"symbol": "CCND1", "category": "Transcription Factor", "description": "Cyclin D1, cell cycle regulator"},
        {"symbol": "E2F1", "category": "Transcription Factor", "description": "E2F family, cell cycle transcription"},
        {"symbol": "STAT3", "category": "Transcription Factor", "description": "Signal transducer and activator of transcription"},
        {"symbol": "NFKB1", "category": "Transcription Factor", "description": "NF-kappa-B, inflammation and immunity"},
        {"symbol": "HIF1A", "category": "Transcription Factor", "description": "Hypoxia-inducible factor 1-alpha"},
        {"symbol": "ESR1", "category": "Transcription Factor", "description": "Estrogen receptor alpha"},
        {"symbol": "FOXA1", "category": "Transcription Factor", "description": "Forkhead box protein A1"},
        {"symbol": "CDKN2A", "category": "Transcription Factor", "description": "p16INK4a, cell cycle inhibitor"},
        {"symbol": "CDKN1A", "category": "Transcription Factor", "description": "p21, CDK inhibitor"},
        {"symbol": "E2F3", "category": "Transcription Factor", "description": "E2F family, cell cycle transcription"},
        {"symbol": "MDM2", "category": "Transcription Factor", "description": "E3 ubiquitin ligase, p53 regulator"},
        {"symbol": "MYCN", "category": "Transcription Factor", "description": "MYC family, neuroblastoma"},
        {"symbol": "NOTCH1", "category": "Transcription Factor", "description": "Notch signaling pathway"},
        {"symbol": "CTNNB1", "category": "Transcription Factor", "description": "Beta-catenin, Wnt signaling"},
    ]
    
    added_count = 0
    skipped_count = 0
    
    for gene_data in seed_data:
        # Check if gene already exists
        existing_gene = db.query(Gene).filter(Gene.symbol == gene_data["symbol"]).first()
        
        if existing_gene:
            print(f"⏭️  Skipped: {gene_data['symbol']} (already exists)")
            skipped_count += 1
        else:
            # Create new gene entry
            new_gene = Gene(**gene_data)
            db.add(new_gene)
            print(f"✅ Added: {gene_data['symbol']} ({gene_data['category']})")
            added_count += 1
    
    # Commit all changes
    db.commit()
    db.close()
    
    print(f"\n{'='*60}")
    print(f"Seeding Complete!")
    print(f"{'='*60}")
    print(f"✅ Added: {added_count} genes")
    print(f"⏭️  Skipped: {skipped_count} genes (duplicates)")
    print(f"📊 Total genes in database: {added_count + skipped_count}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n🧬 Starting Gene Database Seeding...")
    print("="*60)
    seed_genes()

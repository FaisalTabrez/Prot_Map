"""
PPI Network Explorer - Backend API
===================================
This FastAPI backend automates the workflow of constructing and analyzing 
Protein-Protein Interaction (PPI) networks for disease research.

Biology Context:
- Hubs (high degree centrality): Proteins with many interactions, often essential
- Bottlenecks (high betweenness centrality): Proteins controlling information flow
- Modules/Clusters: Functional protein complexes or pathways

Auto-Enrichment:
- New genes are automatically enriched via Google Gemini API
- Results cached in SQLite to avoid redundant API calls
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import requests
import networkx as nx
import pandas as pd
from collections import defaultdict
import io
import json
import io
import asyncio
from sqlalchemy.orm import Session

# Database imports
from database import (
    SessionLocal, engine, Base, get_db, get_genes_by_symbols, 
    bulk_create_genes, get_all_categories, get_categories_by_names,
    bulk_create_categories
)
from models import Gene, Category
from ai_service import batch_fetch_genes

app = FastAPI(
    title="PPI Network Explorer API",
    description="Automated PPI network construction and analysis",
    version="1.0.0"
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified")

# CORS configuration - allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA MODELS
# ============================================================================

class GeneRequest(BaseModel):
    """Request model for gene list submission"""
    genes: List[str] = Field(..., description="List of gene symbols (e.g., TP53, BRCA1)")
    confidence_threshold: Optional[float] = Field(0.4, description="STRING DB confidence score (0-1)")


class CategoryReviewRequest(BaseModel):
    """Request model for category review confirmation"""
    new_categories: List[str] = Field(..., description="List of new category names to create")
    pending_genes: List[Dict[str, str]] = Field(..., description="Gene data to save after category approval")
    original_gene_list: List[str] = Field(..., description="Original gene list from user for network analysis")
    confidence_threshold: Optional[float] = Field(0.4, description="STRING DB confidence score")


# ============================================================================
# DATABASE HELPER FUNCTIONS
# ============================================================================

def get_gene_category(gene_symbol: str, db: Session) -> str:
    """
    Query the database for a gene's functional category name.
    
    Args:
        gene_symbol: Gene symbol (e.g., 'TP53')
        db: Database session
    
    Returns:
        Category name string or 'Unknown' if not found
    """
    gene = db.query(Gene).filter(Gene.symbol == gene_symbol.upper()).first()
    if gene and gene.category_ref:
        return gene.category_ref.name
    return "Unknown"


async def enrich_missing_genes(gene_symbols: List[str], db: Session) -> Optional[Dict[str, Any]]:
    """
    Auto-enrichment: Fetch metadata for genes not in database using Gemini API.
    
    Implements category review workflow:
    - If AI suggests new categories not in DB, returns review data (doesn't save)
    - If all categories exist, saves genes immediately and returns None
    
    Workflow:
    1. Check which genes are missing from database
    2. If missing genes found, query Gemini API in parallel
    3. Extract unique categories from AI responses
    4. Check if any new categories exist
    5a. If new categories -> Return review data for frontend approval
    5b. If all categories exist -> Bulk insert genes and return None
    
    Args:
        gene_symbols: List of gene symbols from user request
        db: Database session for queries and inserts
    
    Returns:
        None if successful auto-save
        Dict with review data if new categories detected:
        {
            "new_categories": ["Ion Channel", "Cytokine"],
            "pending_genes": [{"symbol": "...", "category": "...", "description": "..."}]
        }
    """
    # Normalize symbols to uppercase
    normalized_symbols = [s.upper() for s in gene_symbols]
    
    # Check which genes exist in database
    existing_genes = get_genes_by_symbols(db, normalized_symbols)
    existing_symbols = set(existing_genes.keys())
    
    # Identify missing genes
    missing_symbols = [s for s in normalized_symbols if s not in existing_symbols]
    
    if not missing_symbols:
        print(f"✓ All {len(normalized_symbols)} genes found in database (cache hit)")
        return None
    
    print(f"🔍 Auto-enrichment: {len(missing_symbols)} new genes found")
    print(f"   Missing: {', '.join(missing_symbols[:10])}{'...' if len(missing_symbols) > 10 else ''}")
    
    # Fetch gene info from Gemini API in parallel
    gene_info_map = await batch_fetch_genes(missing_symbols)
    
    # Extract unique categories from AI responses
    ai_categories = set(info["category"] for info in gene_info_map.values())
    print(f"📂 Categories from AI: {', '.join(ai_categories)}")
    
    # Check which categories exist in database
    existing_categories = get_categories_by_names(db, list(ai_categories))
    existing_category_names = set(existing_categories.keys())
    
    # Identify new categories that need user approval
    new_categories = list(ai_categories - existing_category_names)
    
    if new_categories:
        print(f"⚠️  New categories detected: {', '.join(new_categories)}")
        print(f"   Pausing for user review...")
        
        # Return review data - don't save yet
        pending_genes = [
            {
                "symbol": symbol,
                "category": info["category"],
                "description": info["description"]
            }
            for symbol, info in gene_info_map.items()
        ]
        
        return {
            "new_categories": new_categories,
            "pending_genes": pending_genes
        }
    
    # All categories exist - proceed with auto-save
    print(f"✓ All categories exist in database")
    
    # Prepare data for bulk insert (with category_id from existing categories)
    genes_to_insert = [
        {
            "symbol": symbol,
            "category_id": existing_categories[info["category"]].id,
            "description": info["description"]
        }
        for symbol, info in gene_info_map.items()
    ]
    
    # Bulk insert into database
    if genes_to_insert:
        inserted_count = bulk_create_genes(db, genes_to_insert)
        print(f"✓ Cached {inserted_count} new genes for future requests")
    
    return None


# ============================================================================
# PHASE 2: NETWORK CONSTRUCTION FROM STRING DB
# ============================================================================

def fetch_string_interactions(genes: List[str], confidence: float = 0.4) -> tuple[List[Dict], List[str], List[str]]:
    """
    Fetch protein-protein interactions from STRING database.
    
    STRING DB is a comprehensive database of known and predicted PPIs.
    Higher confidence scores indicate more reliable interactions.
    
    Args:
        genes: List of gene symbols
        confidence: Minimum interaction confidence (0.0-1.0)
    
    Returns:
        Tuple of (interactions, genes_found, genes_not_found)
    """
    # Clean and standardize input genes
    cleaned_genes = [gene.strip().upper() for gene in genes if gene.strip()]
    
    if not cleaned_genes:
        raise ValueError("No valid genes provided")
    
    # STRING DB API endpoint for network retrieval
    string_api_url = "https://string-db.org/api/json/network"
    
    # Prepare API parameters
    params = {
        'identifiers': '%0d'.join(cleaned_genes),  # %0d is URL-encoded newline
        'species': 9606,  # NCBI taxonomy ID for Homo sapiens
        'caller_identity': 'BioNet_Project',  # Identify your application
        'required_score': int(confidence * 1000)  # STRING uses 0-1000 scale
    }
    
    try:
        response = requests.get(string_api_url, params=params, timeout=30)
        response.raise_for_status()
        interactions = response.json()
        
        # Track which genes were found in the network
        genes_in_network = set()
        if interactions:
            for interaction in interactions:
                genes_in_network.add(interaction.get('preferredName_A', '').upper())
                genes_in_network.add(interaction.get('preferredName_B', '').upper())
        
        # Identify genes not found
        genes_found = [g for g in cleaned_genes if g in genes_in_network]
        genes_not_found = [g for g in cleaned_genes if g not in genes_in_network]
        
        # Handle empty response gracefully
        if not interactions:
            print(f"⚠️ Warning: No interactions found for genes: {cleaned_genes[:5]}...")
            return [], [], cleaned_genes
        
        print(f"✓ Retrieved {len(interactions)} interactions from STRING DB")
        print(f"✓ Found {len(genes_found)} genes in network, {len(genes_not_found)} not found")
        return interactions, genes_found, genes_not_found
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"STRING DB API error: {str(e)}"
        )

# ============================================================================
# FILE PARSING UTILITIES
# ============================================================================

def parse_gene_file(file_content: bytes, filename: str) -> List[str]:
    """
    Parse uploaded file (Excel or TSV) to extract gene symbols.
    
    Args:
        file_content: File content as bytes
        filename: Name of the uploaded file
    
    Returns:
        List of gene symbols
    """
    genes = []
    
    try:
        if filename.endswith(('.xlsx', '.xls')):
            # Parse Excel file
            df = pd.read_excel(io.BytesIO(file_content))
            # Get first column (assumes genes are in first column)
            if len(df.columns) > 0:
                genes = df.iloc[:, 0].astype(str).tolist()
        
        elif filename.endswith(('.tsv', '.txt', '.tab')):
            # Parse TSV/Tab-delimited file
            df = pd.read_csv(io.BytesIO(file_content), sep='\t')
            # Get first column
            if len(df.columns) > 0:
                genes = df.iloc[:, 0].astype(str).tolist()
        
        elif filename.endswith('.csv'):
            # Parse CSV file
            df = pd.read_csv(io.BytesIO(file_content))
            # Get first column
            if len(df.columns) > 0:
                genes = df.iloc[:, 0].astype(str).tolist()
        
        else:
            raise ValueError(f"Unsupported file format: {filename}")
        
        # Clean and filter genes
        genes = [g.strip() for g in genes if g and str(g).strip() and str(g).lower() not in ['nan', 'none', '']]
        print(f"✓ Parsed {len(genes)} genes from {filename}")
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error parsing file: {str(e)}"
        )
    
    return genes

# ============================================================================
# PHASE 3 & 4: NETWORK ANALYSIS
# ============================================================================

def analyze_network(interactions: List[Dict], genes_found: List[str], genes_not_found: List[str], db: Session) -> Dict[str, Any]:
    """
    Perform comprehensive topological analysis of the PPI network.
    
    Analyses performed:
    1. Degree Centrality: Identifies hub proteins (highly connected)
    2. Betweenness Centrality: Identifies bottleneck proteins (control information flow)
    3. Module Detection: Identifies functional protein complexes/pathways
    4. Gene Category Annotation: Retrieves biological function from database
    
    Args:
        interactions: List of interaction dictionaries from STRING
        genes_found: Genes successfully retrieved from STRING
        genes_not_found: Genes not found in STRING database
        db: Database session for gene category lookups
    
    Returns:
        Cytoscape.js formatted network with analysis results
    """
    if not interactions:
        # Return empty network structure
        return {
            "elements": [],
            "stats": {
                "total_nodes": 0,
                "total_edges": 0,
                "top_hubs": [],
                "top_bottlenecks": [],
                "modules_detected": 0
            }
        }
    
    # Build NetworkX graph from STRING interactions
    G = nx.Graph()
    
    for interaction in interactions:
        # STRING returns protein IDs like "9606.ENSP00000269305"
        # Extract preferred gene name for node labels
        protein_a = interaction.get('preferredName_A', interaction.get('stringId_A'))
        protein_b = interaction.get('preferredName_B', interaction.get('stringId_B'))
        score = interaction.get('score', 0)
        
        # Add edge with interaction confidence as weight
        G.add_edge(protein_a, protein_b, weight=score)
    
    print(f"✓ Built network: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    
    # ========================================================================
    # TOPOLOGICAL ANALYSIS
    # ========================================================================
    
    # 1. Degree Centrality (Hub Analysis)
    # Higher degree = more interaction partners = potential hub protein
    degree_centrality = nx.degree_centrality(G)
    
    # 2. Betweenness Centrality (Bottleneck Analysis)
    # Higher betweenness = lies on many shortest paths = controls information flow
    # These proteins are often critical for network integrity
    betweenness_centrality = nx.betweenness_centrality(G)
    
    # 3. Module Detection (Simulating MCODE algorithm)
    # MCODE identifies densely connected regions (protein complexes/pathways)
    # Using greedy modularity optimization as approximation
    try:
        communities = nx.algorithms.community.greedy_modularity_communities(G)
        node_to_module = {}
        for module_id, community in enumerate(communities):
            for node in community:
                node_to_module[node] = module_id
        print(f"✓ Detected {len(communities)} functional modules")
    except:
        # Fallback if modularity detection fails
        node_to_module = {node: 0 for node in G.nodes()}
        communities = []
    
    # ========================================================================
    # FORMAT FOR CYTOSCAPE.JS
    # ========================================================================
    
    elements = []
    
    # Add nodes with computed metrics and category from database
    for node in G.nodes():
        # Query database for gene category
        category = get_gene_category(node, db)
        
        elements.append({
            "data": {
                "id": node,
                "label": node,
                "degree": round(degree_centrality.get(node, 0), 4),
                "betweenness": round(betweenness_centrality.get(node, 0), 4),
                "module": node_to_module.get(node, 0),
                "node_degree": G.degree(node),  # Actual number of connections
                "category": category  # Biological function from database
            }
        })
    
    # Add edges
    for edge in G.edges(data=True):
        source, target, attrs = edge
        elements.append({
            "data": {
                "source": source,
                "target": target,
                "score": round(attrs.get('weight', 0), 3)
            }
        })
    
    # ========================================================================
    # GENERATE STATISTICS
    # ========================================================================
    
    # Top 5 Hub proteins (highest degree centrality)
    top_hubs = sorted(
        [{"gene": gene, "degree": G.degree(gene), "centrality": degree_centrality[gene]} 
         for gene in G.nodes()],
        key=lambda x: x['degree'],
        reverse=True
    )[:5]
    
    # Top 5 Bottleneck proteins (highest betweenness centrality)
    top_bottlenecks = sorted(
        [{"gene": gene, "betweenness": round(betweenness_centrality[gene], 4)} 
         for gene in G.nodes()],
        key=lambda x: x['betweenness'],
        reverse=True
    )[:5]
    
    return {
        "elements": elements,
        "stats": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "top_hubs": top_hubs,
            "top_bottlenecks": top_bottlenecks,
            "modules_detected": len(communities),
            "genes_found": len(genes_found),
            "genes_not_found": len(genes_not_found)
        },
        "genes_found": genes_found,
        "genes_not_found": genes_not_found
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "PPI Network Explorer API",
        "version": "1.0.0"
    }

@app.post("/analyze")
async def analyze_ppi_network(request: GeneRequest, db: Session = Depends(get_db)):
    """
    Main endpoint: Construct and analyze PPI network from seed genes.
    
    Workflow:
    1. Auto-enrich missing genes using Gemini API (cached in SQLite)
    2. If new categories detected -> Return 202 (Accepted) with review data
    3. Fetch interactions from STRING DB
    4. Build network graph
    5. Perform topological analysis
    6. Detect functional modules
    7. Annotate nodes with gene categories from database
    8. Return Cytoscape.js formatted results
    
    Note: Auto-enrichment adds a slight delay only on the *first* run for new genes.
    Subsequent requests use cached database values for instant response.
    
    Example request:
    {
        "genes": ["TP53", "BRCA1", "EGFR", "AKT1"],
        "confidence_threshold": 0.4
    }
    
    Returns:
    - 202 (Accepted) with review data if new categories detected
    - 200 (OK) with network analysis if all categories exist
    """
    try:
        # Phase 1: Auto-enrich missing genes from Gemini API
        review_data = await enrich_missing_genes(request.genes, db)
        
        # If new categories detected, pause for user review
        if review_data:
            return {
                "status": "review_required",
                "new_categories": review_data["new_categories"],
                "pending_genes": review_data["pending_genes"]
            }
        
        # Phase 2: Fetch interactions from STRING DB
        interactions, genes_found, genes_not_found = fetch_string_interactions(
            request.genes,
            request.confidence_threshold
        )
        
        # Phase 3 & 4: Analyze network with database category annotation
        analysis_results = analyze_network(interactions, genes_found, genes_not_found, db)
        
        return analysis_results
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/confirm-categories")
async def confirm_new_categories(request: CategoryReviewRequest, db: Session = Depends(get_db)):
    """
    Endpoint for user approval of new functional categories.
    
    After user reviews and approves new categories suggested by AI:
    1. Create the new Category entries in the database (with default grey color)
    2. Save the pending Gene entries with proper category foreign keys
    3. Proceed with network analysis using original gene list
    4. Return complete network visualization
    
    Workflow:
    - Frontend displays modal with new categories
    - User clicks "Approve & Continue"
    - This endpoint creates categories, saves genes, and generates network
    
    Example request:
    {
        "new_categories": ["Ion Channel", "Cytokine"],
        "pending_genes": [
            {"symbol": "SCN1A", "category": "Ion Channel", "description": "..."},
            {"symbol": "IL6", "category": "Cytokine", "description": "..."}
        ],
        "original_gene_list": ["SCN1A", "IL6", "TP53"],
        "confidence_threshold": 0.4
    }
    """
    try:
        print(f"\n{'='*60}")
        print(f"📋 Category Review: User approved {len(request.new_categories)} new categories")
        print(f"   Categories: {', '.join(request.new_categories)}")
        
        # Step 1: Create new categories with default grey color
        categories_to_create = [
            {"name": cat_name, "color": "#808080"}
            for cat_name in request.new_categories
        ]
        
        created_count = bulk_create_categories(db, categories_to_create)
        print(f"✓ Created {created_count} new categories")
        
        # Step 2: Fetch the newly created categories to get their IDs
        all_categories = get_categories_by_names(
            db,
            [gene["category"] for gene in request.pending_genes]
        )
        
        # Step 3: Save pending genes with category_id foreign keys
        genes_to_insert = [
            {
                "symbol": gene["symbol"],
                "category_id": all_categories[gene["category"]].id,
                "description": gene.get("description", "")
            }
            for gene in request.pending_genes
            if gene["category"] in all_categories
        ]
        
        if genes_to_insert:
            inserted_count = bulk_create_genes(db, genes_to_insert)
            print(f"✓ Saved {inserted_count} pending genes with approved categories")
        
        print(f"{'='*60}\n")
        
        # Step 4: Proceed with normal network analysis
        interactions, genes_found, genes_not_found = fetch_string_interactions(
            request.original_gene_list,
            request.confidence_threshold
        )
        
        analysis_results = analyze_network(interactions, genes_found, genes_not_found, db)
        
        return analysis_results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Category confirmation failed: {str(e)}")


@app.post("/upload-genes")
async def upload_gene_file(file: UploadFile = File(...)):
    """
    Upload gene list from Excel, CSV, or TSV file.
    
    Accepts:
    - Excel files (.xlsx, .xls)
    - CSV files (.csv)
    - TSV/Tab-delimited files (.tsv, .txt, .tab)
    
    The first column of the file should contain gene symbols.
    """
    try:
        # Validate file type
        allowed_extensions = ['.xlsx', '.xls', '.csv', '.tsv', '.txt', '.tab']
        if not any(file.filename.endswith(ext) for ext in allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Parse genes from file
        genes = parse_gene_file(content, file.filename)
        
        if not genes:
            raise HTTPException(
                status_code=400,
                detail="No valid genes found in file"
            )
        
        return {
            "genes": genes,
            "count": len(genes),
            "filename": file.filename
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )

@app.post("/export/csv")
async def export_network_csv(data: Dict[str, Any]):
    """
    Export network analysis results as CSV.
    Returns combined CSV with nodes, edges, hubs, and bottlenecks.
    """
    try:
        stats = data.get('stats', {})
        elements = data.get('elements', [])
        
        # Create nodes and edges data
        nodes_data = []
        edges_data = []
        
        for elem in elements:
            if 'source' in elem['data']:
                # It's an edge
                edges_data.append({
                    'source': elem['data']['source'],
                    'target': elem['data']['target'],
                    'score': elem['data'].get('score', 0)
                })
            else:
                # It's a node
                nodes_data.append({
                    'gene': elem['data']['id'],
                    'degree': elem['data'].get('degree', 0),
                    'betweenness': elem['data'].get('betweenness', 0),
                    'module': elem['data'].get('module', 0),
                    'connections': elem['data'].get('node_degree', 0)
                })
        
        # Create CSV content
        nodes_df = pd.DataFrame(nodes_data)
        edges_df = pd.DataFrame(edges_data)
        hubs_df = pd.DataFrame(stats.get('top_hubs', []))
        bottlenecks_df = pd.DataFrame(stats.get('top_bottlenecks', []))
        
        # Combine into one CSV with sections
        import io
        output = io.StringIO()
        output.write("=== NETWORK NODES ===\\n")
        nodes_df.to_csv(output, index=False)
        output.write("\\n=== NETWORK EDGES ===\\n")
        edges_df.to_csv(output, index=False)
        output.write("\\n=== TOP HUBS ===\\n")
        hubs_df.to_csv(output, index=False)
        output.write("\\n=== TOP BOTTLENECKS ===\\n")
        bottlenecks_df.to_csv(output, index=False)
        output.write("\\n=== NETWORK STATISTICS ===\\n")
        output.write(f"Total Nodes,{stats.get('total_nodes', 0)}\\n")
        output.write(f"Total Edges,{stats.get('total_edges', 0)}\\n")
        output.write(f"Modules Detected,{stats.get('modules_detected', 0)}\\n")
        
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=network_analysis.csv"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.post("/export/json")
async def export_network_json(data: Dict[str, Any]):
    """
    Export complete network analysis as JSON.
    """
    try:
        import json
        import io
        output = io.BytesIO(json.dumps(data, indent=2).encode())
        return StreamingResponse(
            output,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=network_analysis.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.get("/protein/{gene_symbol}")
async def get_protein_details(gene_symbol: str):
    """
    Fetch detailed protein information from STRING DB.
    """
    try:
        gene_symbol = gene_symbol.upper().strip()
        
        # Fetch from STRING DB
        string_url = "https://string-db.org/api/json/get_string_ids"
        params = {
            'identifiers': gene_symbol,
            'species': 9606,
            'caller_identity': 'BioNet_Project'
        }
        
        response = requests.get(string_url, params=params, timeout=10)
        response.raise_for_status()
        string_data = response.json()
        
        if not string_data:
            raise HTTPException(status_code=404, detail=f"Protein {gene_symbol} not found")
        
        protein_info = string_data[0]
        
        # Get annotation
        annotation_url = "https://string-db.org/api/json/get_annotation"
        ann_params = {
            'identifiers': protein_info['stringId'],
            'species': 9606,
            'caller_identity': 'BioNet_Project'
        }
        
        ann_response = requests.get(annotation_url, params=ann_params, timeout=10)
        annotation = ann_response.json()[0] if ann_response.ok and ann_response.json() else {}
        
        return {
            'gene': gene_symbol,
            'protein_id': protein_info.get('stringId', ''),
            'preferred_name': protein_info.get('preferredName', gene_symbol),
            'annotation': annotation.get('annotation', 'No description available'),
            'ncbi_url': f"https://www.ncbi.nlm.nih.gov/gene/?term={gene_symbol}",
            'uniprot_url': f"https://www.uniprot.org/uniprot/?query={gene_symbol}+AND+organism:9606",
            'string_url': f"https://string-db.org/network/9606.{protein_info.get('stringId', '')}"
        }
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"External API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching protein details: {str(e)}")

@app.get("/drugs/{gene_symbol}")
async def get_drug_interactions(gene_symbol: str):
    """
    Fetch drug-gene interactions from DGIdb (Drug Gene Interaction Database).
    """
    try:
        gene_symbol = gene_symbol.upper().strip()
        
        # DGIdb API
        dgidb_url = "https://dgidb.org/api/v2/interactions.json"
        params = {'genes': gene_symbol}
        
        response = requests.get(dgidb_url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        if not data.get('matchedTerms'):
            return {
                'gene': gene_symbol,
                'druggable': False,
                'drugs': [],
                'categories': [],
                'message': f"No drug interactions found for {gene_symbol}"
            }
        
        interactions = []
        categories = set()
        
        for match in data.get('matchedTerms', []):
            for interaction in match.get('interactions', []):
                drug_name = interaction.get('drugName', 'Unknown')
                interaction_types = interaction.get('interactionTypes', [])
                
                interactions.append({
                    'drug_name': drug_name,
                    'interaction_types': interaction_types,
                    'sources': interaction.get('sources', [])
                })
                
                categories.update(interaction_types)
        
        return {
            'gene': gene_symbol,
            'druggable': len(interactions) > 0,
            'drug_count': len(interactions),
            'drugs': interactions[:10],  # Limit to top 10
            'categories': list(categories),
            'dgidb_url': f"https://dgidb.org/genes/{gene_symbol}"
        }
    
    except requests.exceptions.RequestException as e:
        # DGIdb might be down, return gracefully
        return {
            'gene': gene_symbol,
            'druggable': False,
            'drugs': [],
            'categories': [],
            'message': f"Could not fetch drug data: {str(e)}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching drug data: {str(e)}")

# ============================================================================
# DEVELOPMENT SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting PPI Network Explorer API...")
    print("📡 API Documentation: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

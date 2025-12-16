"""
AI-Powered Gene Enrichment Service
===================================
Uses Google Gemini API to automatically fetch gene metadata when not in database.
This provides a self-healing knowledge base that expands as users query new genes.
"""

import os
import json
import re
from typing import Dict, Optional
import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)  # type: ignore
    print("✓ Gemini API configured")
else:
    print("⚠️  GEMINI_API_KEY not found in environment. Auto-enrichment disabled.")


async def fetch_gene_info(gene_symbol: str) -> Dict[str, str]:
    """
    Fetch gene description and functional category from Google Gemini API.
    
    This function queries the AI model for biological metadata when a gene
    is not found in the local database or has an "Unknown" classification.
    Results are cached in SQLite to avoid redundant API calls.
    
    Uses an expert biologist prompt with priority categories to ensure
    accurate classification across all biological domains (not just cancer).
    
    Args:
        gene_symbol: Gene symbol (e.g., 'TP53', 'BRCA1', 'INS')
    
    Returns:
        Dictionary with 'description' and 'category' keys.
        On failure, returns default values with category='Unknown'.
    
    Example response:
        {
            "description": "Guardian of genome, tumor suppressor",
            "category": "Tumor Suppressor"
        }
        OR
        {
            "description": "Pancreatic hormone regulating glucose",
            "category": "Hormone"
        }
    """
    
    # Fallback response if API is unavailable or fails
    default_response = {
        "description": f"Gene {gene_symbol} (auto-enrichment pending)",
        "category": "Unknown"
    }
    
    # Check if API key is configured
    if not GEMINI_API_KEY:
        print(f"⚠️  Skipping Gemini lookup for {gene_symbol} (no API key)")
        return default_response
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')  # type: ignore
        
        # Construct the expert biologist prompt with priority categories
        prompt = f"""You are an expert Biologist. Classify the following human gene into a **Single Functional Category**.

Gene Symbol: {gene_symbol}

**Category Selection Rules:**
1. First, check if the gene fits one of these priority categories:
   - Enzyme
   - Transporter
   - Ion Channel
   - Hormone
   - Receptor
   - Transcription Factor
   - Structural Protein
   - Tumor Suppressor
   - Oncogene
   - Kinase

2. If none of the above fit, generate a concise 1-2 word biological label from standard terminology:
   Examples: "Cytokine", "Growth Factor", "Chemokine", "Adhesion Molecule", "Extracellular Matrix"

3. Use Title Case (e.g., "Ion Channel", not "ion channel")

Return ONLY valid JSON in this exact format (no markdown, no backticks, no extra text):
{{
  "description": "Brief biological function in max 15 words",
  "category": "Single functional category from priority list or custom 1-2 word label"
}}

**Important:**
- Be specific and accurate based on the gene's primary function
- For multi-functional genes, choose the most prominent/well-known function
- Avoid generic terms like "Protein" or "Gene"
"""
        
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up markdown formatting if present
        # Remove ```json and ``` wrappers
        cleaned_text = re.sub(r'^```(?:json)?\s*', '', response_text)
        cleaned_text = re.sub(r'\s*```$', '', cleaned_text)
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON response
        gene_info = json.loads(cleaned_text)
        
        # Validate required fields
        if 'description' not in gene_info or 'category' not in gene_info:
            raise ValueError("Missing required fields in Gemini response")
        
        # Normalize category (title case, trim whitespace)
        gene_info['category'] = gene_info['category'].strip().title()
        # Normalize category (title case, trim whitespace)
        gene_info['category'] = gene_info['category'].strip().title()
        
        # Truncate description if too long
        if len(gene_info['description']) > 150:
            gene_info['description'] = gene_info['description'][:147] + "..."
        
        print(f"✓ Gemini enriched: {gene_symbol} -> {gene_info['category']}")
        return gene_info
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing failed for {gene_symbol}: {e}")
        print(f"   Raw response: {response_text[:100]}...")
        return default_response
    
    except Exception as e:
        print(f"❌ Gemini API error for {gene_symbol}: {type(e).__name__} - {str(e)}")
        return default_response


async def batch_fetch_genes(gene_symbols: list[str]) -> Dict[str, Dict[str, str]]:
    """
    Fetch information for multiple genes concurrently from Gemini API.
    
    Uses asyncio to parallelize requests for efficiency.
    Note: This adds a slight delay only on the *first* run for new genes.
    Subsequent requests use cached data from SQLite.
    
    Args:
        gene_symbols: List of gene symbols to fetch
    
    Returns:
        Dictionary mapping gene symbols to their info dicts
    
    Example:
        {
            "TP53": {"description": "...", "category": "Tumor Suppressor"},
            "EGFR": {"description": "...", "category": "Oncogene"}
        }
    """
    import asyncio
    
    # Fetch all genes concurrently
    # For large lists, consider using asyncio.Semaphore to limit concurrency
    # and avoid rate limits
    tasks = [fetch_gene_info(symbol) for symbol in gene_symbols]
    results = await asyncio.gather(*tasks)
    
    # Build result dictionary
    gene_data = {}
    for symbol, info in zip(gene_symbols, results):
        gene_data[symbol.upper()] = info
    
    return gene_data

async def fetch_extended_details(symbol: str) -> dict:
    """
    Fetch comprehensive clinical details for a gene from Gemini AI.
    
    This function generates a detailed clinical report including:
    - Full gene name
    - Function summary
    - Disease relevance
    - Known drug interactions
    - Clinical significance rating
    
    Used for the "Deep Dive" feature when users click a gene node.
    Results are cached in the database to avoid repeated API calls.
    
    Args:
        symbol: Gene symbol (e.g., 'TP53', 'EGFR')
    
    Returns:
        Dictionary with clinical details:
        {
            "full_name": str,
            "function_summary": str (2 sentences max),
            "disease_relevance": str,
            "known_drugs": list[str] (up to 5 FDA-approved drugs),
            "clinical_significance": str ("High" | "Moderate" | "Low")
        }
    
    Raises:
        Exception: If API call fails or response is invalid
    """
    # Check if API key is configured
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment")
    
    # Use the already configured genai instance
    model = genai.GenerativeModel("gemini-1.5-flash")  # type: ignore
    
    # Enhanced clinical prompt
    prompt = f"""You are an expert Clinical Biologist and Pharmacologist. Generate a comprehensive clinical report for the human gene: {symbol}

Return ONLY valid JSON in this exact format (no markdown, no backticks, no extra text):
{{
  "full_name": "Full gene name (e.g., Tumor Protein p53)",
  "function_summary": "Concise description of the gene's primary biological function (2 sentences maximum)",
  "disease_relevance": "Description of the gene's role in human disease and pathology (2-3 sentences)",
  "known_drugs": ["Drug1", "Drug2", "Drug3", "Drug4", "Drug5"],
  "clinical_significance": "High or Moderate or Low"
}}

**Instructions for each field:**

1. **full_name**: The complete, official gene name. Use standard nomenclature.

2. **function_summary**: 2 sentences maximum. Focus on the primary molecular function and biological process.

3. **disease_relevance**: 2-3 sentences. Explain the gene's role in human diseases. Mention specific cancers, genetic disorders, or other pathologies where this gene is implicated.

4. **known_drugs**: Array of up to 5 FDA-approved drugs, experimental compounds, or targeted therapies that interact with this gene or its protein product. 
   - For cancer genes: Include targeted therapies, kinase inhibitors, monoclonal antibodies
   - For metabolic genes: Include relevant medications
   - For rare disease genes: Include any available treatments
   - If fewer than 5 drugs exist, return what's available
   - If NO drugs target this gene, return an empty array: []

5. **clinical_significance**: 
   - "High" = Established therapeutic target, multiple FDA-approved drugs, major role in disease
   - "Moderate" = Emerging target, some experimental drugs, moderate disease association
   - "Low" = Limited clinical data, no current drugs, minor disease association

**Examples:**

For TP53:
{{
  "full_name": "Tumor Protein p53",
  "function_summary": "Acts as a tumor suppressor by regulating the cell cycle and preventing genome mutations. Activates DNA repair proteins and can initiate apoptosis if DNA damage is irreparable.",
  "disease_relevance": "Mutations in TP53 are found in over 50% of human cancers, making it one of the most frequently mutated genes in cancer. Li-Fraumeni syndrome, a hereditary disorder predisposing to multiple cancers, is caused by germline TP53 mutations.",
  "known_drugs": ["APR-246 (Eprenetapopt)", "COTI-2", "Kevetrin", "Idasanutlin", "Navtemadlin"],
  "clinical_significance": "High"
}}

For INS (Insulin):
{{
  "full_name": "Insulin",
  "function_summary": "Regulates glucose metabolism by promoting cellular uptake of glucose and glycogen synthesis. Acts as a key metabolic hormone controlling blood sugar levels.",
  "disease_relevance": "Mutations in INS cause neonatal diabetes mellitus and maturity-onset diabetes of the young (MODY). Insulin deficiency or resistance is central to Type 1 and Type 2 diabetes.",
  "known_drugs": ["Insulin Lispro", "Insulin Aspart", "Insulin Glargine", "Insulin Detemir", "Insulin Degludec"],
  "clinical_significance": "High"
}}

**Return ONLY the JSON. No extra text, no markdown formatting.**
"""
    
    try:
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up markdown formatting if present
        cleaned_text = re.sub(r'^```(?:json)?\s*', '', response_text)
        cleaned_text = re.sub(r'\s*```$', '', cleaned_text)
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON response
        details = json.loads(cleaned_text)
        
        # Validate required fields
        required_fields = ["full_name", "function_summary", "disease_relevance", 
                          "known_drugs", "clinical_significance"]
        for field in required_fields:
            if field not in details:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate clinical_significance values
        valid_significance = ["High", "Moderate", "Low"]
        if details["clinical_significance"] not in valid_significance:
            details["clinical_significance"] = "Moderate"  # Default fallback
        
        # Ensure known_drugs is a list
        if not isinstance(details["known_drugs"], list):
            details["known_drugs"] = []
        
        return details
        
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse Gemini response for {symbol}: {e}")
        print(f"   Raw response: {response_text[:200]}...")
        raise Exception(f"Invalid JSON response from Gemini for {symbol}")
    except Exception as e:
        print(f"❌ Error fetching extended details for {symbol}: {e}")
        raise
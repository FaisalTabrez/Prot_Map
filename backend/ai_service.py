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
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✓ Gemini API configured")
else:
    print("⚠️  GEMINI_API_KEY not found in environment. Auto-enrichment disabled.")


async def fetch_gene_info(gene_symbol: str) -> Dict[str, str]:
    """
    Fetch gene description and functional category from Google Gemini API.
    
    This function queries the AI model for biological metadata when a gene
    is not found in the local database. Results are cached in SQLite to avoid
    redundant API calls.
    
    Args:
        gene_symbol: Gene symbol (e.g., 'TP53', 'BRCA1')
    
    Returns:
        Dictionary with 'description' and 'category' keys.
        On failure, returns default values with category='Unknown'.
    
    Example response:
        {
            "description": "Guardian of genome, tumor suppressor",
            "category": "Tumor Suppressor"
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
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Construct the prompt - allow any concise category (disease-agnostic)
        prompt = f"""Provide information about the human gene {gene_symbol}.

Return ONLY valid JSON in this exact format (no markdown, no backticks, no extra text):
{{
  "description": "Brief biological function in max 15 words",
  "category": "Concise functional category (max 2 words, e.g., 'Ion Channel', 'Cytokine', 'Enzyme', 'Tumor Suppressor')"
}}

Gene: {gene_symbol}

Important: 
- Category should be a general functional class (e.g., 'Receptor', 'Kinase', 'Transcription Factor')
- Use standard biological terminology
- Keep it concise (max 2 words)
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

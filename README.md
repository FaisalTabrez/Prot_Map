# 🧬 PPI Network Explorer

**Professional Protein-Protein Interaction Network Analysis Platform**

A comprehensive full-stack bioinformatics tool featuring dark-mode interface, interactive visualizations, drug target discovery, and multi-format export capabilities for disease-associated protein network research.

---

## 🎯 Features

### Core Workflow
#### Phase 1: Gene Input & Preparation
- **Disease/Condition Context**: Required disease name input for contextual analysis
- **Flexible Input Methods**:
  - Manual entry (comma, space, or newline separated)
  - **File Upload**: Excel (.xlsx, .xls), CSV, TSV, or TXT files
  - Automatic gene extraction from uploaded files
- Pre-loaded example datasets (Breast Cancer genes)
- Real-time validation and error tracking

#### Phase 2: Network Construction
- Fetches protein-protein interactions from **STRING DB v12**
- Configurable confidence thresholds (default: 0.4 = medium-high confidence)
- Robust error handling and API failure recovery
- **Missing Gene Detection**: Tracks and displays genes not found in STRING DB

#### Phase 3: Topological Analysis
- **Degree Centrality**: Identifies hub proteins (highly connected)
- **Betweenness Centrality**: Identifies bottleneck proteins (control information flow)
- **Module Detection**: Discovers functional protein complexes/pathways using greedy modularity optimization

#### Phase 4: Interactive Visualization
- **Dark "Cyber-Biology" Theme**: Professional scientific dashboard
- **Cytoscape.js** powered network graph with physics-based COSE layout
- **Visual Encoding**:
  - Node size → Degree centrality (larger = more connections)
  - Node color → Functional module membership (vibrant palette)
  - Glow effects and smooth animations
- **Interactive Controls**: Zoom, pan, node selection, connection highlighting

### Advanced Features

#### 🔍 Protein Details Modal (Click any node)
- **Protein Information**:
  - Full annotation from STRING Database
  - Protein ID and preferred name
  - External links to NCBI, UniProt, STRING DB
- **Drug Target Analysis**:
  - Real-time drug-gene interaction data from **DGIdb**
  - Lists known drugs targeting the protein
  - Interaction types (inhibitor, agonist, etc.)
  - Data source attribution
  - Druggability status and categories

#### 📊 Export Capabilities
- **CSV Export**: Multi-section report with:
  - All network nodes with centrality metrics
  - All edges with confidence scores
  - Top hub proteins (ranked)
  - Top bottleneck proteins (ranked)
  - Network statistics summary
- **JSON Export**: Complete network data for reproducibility and programmatic analysis
- **PNG Export**: High-resolution (3x) network visualization for presentations/publications

#### 📈 Collapsible Data Panel
- **Hub Proteins Tab**: Top proteins by degree centrality
- **Bottleneck Proteins Tab**: Top proteins by betweenness centrality
- **Functional Modules Tab**: Detected protein clusters with color coding
- Animated progress bars showing relative metrics
- Smooth slide-in/out animations

---

## 🏗️ Architecture

```
Prot_Map/
├── backend/                      # Python FastAPI server
│   ├── main.py                  # API endpoints, network analysis
│   ├── requirements.txt         # Python dependencies
│   └── venv/                    # Virtual environment
│
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── App.jsx                     # Main application logic & state
│   │   ├── components/
│   │   │   ├── NetworkGraph.jsx        # Cytoscape visualization
│   │   │   ├── DataPanel.jsx           # Collapsible analysis panel
│   │   │   └── ProteinDetailsModal.jsx # Node details & drug info
│   │   ├── lib/
│   │   │   └── utils.js                # Utility functions (cn)
│   │   ├── App.css                     # Dark theme styles
│   │   ├── index.css                   # Global styles
│   │   └── main.jsx                    # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md                    # This file
├── NEW_FEATURES.md             # Detailed feature documentation
└── QUICK_START_GUIDE.md        # User guide with examples
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.8+**
- **Node.js 18+** and npm
- Internet connection (for STRING DB API)

---

### Part 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   **Dependencies installed:**
   - `fastapi>=0.124.0` - Web framework
   - `uvicorn>=0.38.0` - ASGI server
   - `networkx>=3.6.0` - Graph analysis
   - `pandas>=2.2.0` - Data manipulation
   - `requests>=2.32.0` - HTTP requests
   - `openpyxl>=3.1.0` - Excel file support

4. **Start the FastAPI server:**
   ```bash
   python main.py
   ```

   ✅ Backend running at: `http://localhost:8000`
   📖 API docs available at: `http://localhost:8000/docs`

---

### Part 2: Frontend Setup

1. **Navigate to frontend directory (new terminal):**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies:**
   ```bash
   npm install
   ```
   
   **Key dependencies installed:**
   - `react@18.2.0` & `react-dom@18.2.0` - UI framework
   - `vite@5.0.8` - Build tool & dev server
   - `tailwindcss@3.4.0` - Utility-first CSS
   - `framer-motion@10.16.16` - Animation library
   - `react-cytoscapejs@2.0.0` - Network visualization
   - `lucide-react@0.294.0` - Icon library
   - `clsx@2.0.0` & `tailwind-merge@2.2.0` - Class utilities

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   ✅ Frontend running at: `http://localhost:5173`

---

## 📖 Usage Guide

### 1. Input Phase
- Open `http://localhost:5173` in your browser
- **Enter Disease/Condition Name** (required): e.g., "Breast Cancer"
- **Choose Input Method**:
  - **Manual Entry**: Paste gene symbols (one per line or comma-separated)
  - **File Upload**: Click "Upload File" and select Excel/CSV/TSV file
- Example genes: `TP53, BRCA1, EGFR, AKT1, PTEN, MYC`
- Or click **"Load Example (Breast Cancer)"** for a demo dataset

### 2. Network Construction
- Click **"Generate Network"**
- The system will:
  - Query STRING DB for protein interactions
  - Build the network graph with confidence filtering
  - Perform topological analysis (centrality metrics)
  - Detect functional modules
  - Display genes not found (if any)

### 3. Explore Network
- **Graph Visualization**:
  - **Larger nodes** = Hub proteins (many connections)
  - **Different colors** = Different functional modules
  - **Click nodes** to view detailed protein & drug information
  - **Scroll to zoom**, drag to pan
  - Use zoom controls in the corner

- **Protein Details Modal** (click any node):
  - **Info Tab**: Protein description, external links (NCBI, UniProt, STRING)
  - **Drug Targets Tab**: Known drugs, interaction types, druggability status

- **Data Panel** (right side):
  - **Hubs Tab**: Top 5 proteins by degree centrality
  - **Bottlenecks Tab**: Top 5 proteins by betweenness centrality
  - **Modules Tab**: Detected functional clusters

### 4. Export Results
- Click **"Export"** button in header
- Choose format:
  - **CSV Report**: Multi-section spreadsheet (nodes, edges, hubs, bottlenecks, stats)
  - **JSON Export**: Complete network data for reproducibility
  - **PNG Image**: High-resolution visualization for publications

### 5. Results Interpretation

#### **Hub Proteins** (High Degree Centrality)
- Often represent master regulators (e.g., TP53, MYC)
- Mutations can have widespread effects
- Drug targets with broad therapeutic potential

#### **Bottleneck Proteins** (High Betweenness Centrality)
- Control information flow between pathways
- Critical for disease mechanisms
- Removing them can fragment the network

#### **Functional Modules**
- Densely connected protein clusters
- Often represent protein complexes or biological pathways
- Useful for understanding disease mechanisms

---

## 🔬 Biological Context & Research Applications

### Understanding Network Metrics

#### Hub Proteins (High Degree Centrality)
Highly connected proteins that interact with many partners. In disease networks:
- **Biological Role**: Master regulators coordinating multiple cellular processes
- **Examples**: TP53 (tumor suppressor), MYC (transcription factor), EGFR (growth factor receptor)
- **Disease Impact**: Mutations often have widespread downstream effects
- **Therapeutic Potential**: 
  - Prime drug targets due to central role
  - May have broader side effects due to multiple interactions
  - Click protein nodes to check druggability via DGIdb integration

#### Bottleneck Proteins (High Betweenness Centrality)
Proteins that connect different network regions and control information flow:
- **Biological Role**: Bridge different pathways and functional modules
- **Network Position**: Critical for maintaining network integrity
- **Disease Impact**: Disrupting these can fragment disease networks
- **Therapeutic Strategy**: 
  - Targeting bottlenecks can disconnect disease pathways
  - May affect fewer processes than hubs (more specific effects)
  - Essential for pathway crosstalk in complex diseases

#### Functional Modules (Community Detection)
Densely connected protein clusters representing functional units:
- **Biological Meaning**: 
  - Protein complexes (e.g., ribosome, proteasome, DNA repair complexes)
  - Biological pathways (e.g., cell cycle, apoptosis, immune response)
  - Co-regulated gene sets
- **Visual Identification**: Same color in network visualization
- **Research Value**: 
  - Reveals disease mechanisms at pathway level
  - Identifies co-functional protein groups
  - Suggests combination therapy targets

### Drug Target Discovery Workflow

1. **Generate Network**: Input disease-associated genes
2. **Identify Hubs**: Find highly connected proteins (potential drug targets)
3. **Check Druggability**: Click nodes to view DGIdb drug interactions
4. **Assess Specificity**: Compare degree vs betweenness (specificity vs centrality trade-off)
5. **Export Data**: Download CSV for further statistical analysis in R/Python
6. **Literature Mining**: Use external links (NCBI, UniProt) for deeper investigation

---

## 🧪 Example Use Cases

### 1. Cancer Drug Target Discovery
**Workflow:**
- **Input**: Top 50 genes from DisGeNET for breast cancer (or load example)
- **Analysis**: 
  - Identify hub proteins (e.g., TP53, BRCA1, EGFR)
  - Click nodes to check drug interactions via DGIdb
  - Export CSV with centrality metrics for statistical analysis
- **Outcome**: Ranked list of druggable targets with network importance scores
- **Export**: CSV for R/Python analysis, PNG for publication figures

### 2. Neurodegenerative Disease Pathway Analysis
**Workflow:**
- **Input**: Alzheimer's disease-associated genes from GWAS/omics studies
- **Analysis**:
  - Identify bottleneck proteins connecting amyloid and tau pathways
  - Examine functional modules (e.g., autophagy, inflammation clusters)
  - Check STRING external links for pathway enrichment
- **Outcome**: Pathway crosstalk proteins for therapeutic intervention
- **Export**: JSON for reproducible analysis, high-res PNG for presentations

### 3. Drug Repurposing & Polypharmacology
**Workflow:**
- **Input**: Known drug target genes + disease-associated genes
- **Analysis**:
  - Construct combined network
  - Measure network proximity between drug targets and disease proteins
  - Use DGIdb to find FDA-approved drugs targeting network hubs
- **Outcome**: Repurposing candidates with mechanism-of-action insights
- **Export**: Multi-format export for regulatory submission packages

### 4. Biomarker Discovery
**Workflow:**
- **Input**: Upload Excel file with differentially expressed genes from RNA-seq
- **Analysis**:
  - Identify hub proteins in disease network
  - Filter by druggability and tissue expression (via UniProt links)
  - Examine betweenness centrality for diagnostic specificity
- **Outcome**: Candidate biomarkers ranked by network centrality
- **Export**: CSV with complete metrics for validation studies

### 5. Comparative Disease Analysis
**Workflow:**
- **Input**: Generate networks for different disease states (e.g., Stage I vs Stage IV cancer)
- **Analysis**:
  - Export JSON for both networks
  - Compare hub proteins and module structures
  - Identify stage-specific network rewiring
- **Outcome**: Disease progression signatures and stage-specific targets
- **Tools**: Export data → analyze in Python/R with custom scripts

---

## 🛠️ Technical Details

### Backend Stack (Python/FastAPI)
- **FastAPI**: Modern Python web framework with automatic API documentation
- **NetworkX**: Graph analysis library for topological metrics
- **Pandas**: Data manipulation and CSV export
- **Requests**: STRING DB and DGIdb API communication
- **OpenPyXL**: Excel file parsing support
- **Uvicorn**: ASGI server for production-ready deployment

### Frontend Stack (React/Vite)
- **React 18**: Component-based UI framework with hooks
- **Vite**: Fast build tool and hot-reload dev server
- **Tailwind CSS**: Utility-first CSS framework for dark theme
- **Framer Motion**: Smooth animations and transitions
- **Cytoscape.js**: Professional graph visualization library
- **react-cytoscapejs**: React wrapper for Cytoscape
- **Lucide React**: Modern icon library
- **clsx + tailwind-merge**: Dynamic class name management

### Design System
- **Theme**: "Cyber-Biology" dark mode
- **Colors**: 
  - Background: Slate-950 (#020617)
  - Primary: Emerald-500 (#10B981)
  - Accent: Cyan, Purple, Amber gradients
- **Typography**: Inter font family
- **Effects**: Glassmorphic panels, glow shadows, smooth animations

### Data Sources
- **STRING Database v12**: Comprehensive database of known and predicted PPIs
  - Confidence scores: 0-1 (0.4+ = medium-high confidence)
  - Species: Homo sapiens (NCBI taxonomy ID 9606)
  - API: `https://string-db.org/api`
  
- **DGIdb (Drug Gene Interaction Database)**: Drug-gene interaction data
  - Real-time API queries for druggability information
  - API: `https://dgidb.org/api/v2`
  - Timeout: 15 seconds with graceful fallback

---

## 📊 API Reference

### POST `/analyze`
Construct and analyze PPI network from gene list.

**Request Body:**
```json
{
  "genes": ["TP53", "BRCA1", "EGFR"],
  "confidence_threshold": 0.4
}
```

**Response:**
```json
{
  "elements": [
    {
      "data": {
        "id": "TP53",
        "label": "TP53",
        "degree": 0.5234,
        "betweenness": 0.0421,
        "module": 1,
        "node_degree": 15
      }
    },
    {
      "data": {
        "source": "TP53",
        "target": "BRCA1",
        "score": 0.912
      }
    }
  ],
  "stats": {
    "total_nodes": 42,
    "total_edges": 156,
    "top_hubs": [...],
    "top_bottlenecks": [...],
    "modules_detected": 5
  },
  "genes_not_found": ["INVALID_GENE"]
}
```

---

### POST `/upload-genes`
Extract gene list from uploaded file (Excel, CSV, TSV).

**Request:** Multipart form data with file
**Supported formats:** .xlsx, .xls, .csv, .tsv, .txt, .tab

**Response:**
```json
{
  "genes": ["TP53", "BRCA1", "EGFR"],
  "count": 3,
  "message": "Successfully parsed 3 genes from file.xlsx"
}
```

---

### POST `/export/csv`
Export network analysis as CSV with multiple sections.

**Request Body:**
```json
{
  "elements": [...],
  "stats": {...}
}
```

**Response:** CSV file download with sections:
- Network Nodes (id, label, degree, betweenness, module)
- Network Edges (source, target, score)
- Top Hubs (protein, degree_centrality, connections)
- Top Bottlenecks (protein, betweenness_centrality)
- Network Statistics (total_nodes, total_edges, modules_detected)

---

### POST `/export/json`
Export complete network data as JSON.

**Request Body:**
```json
{
  "elements": [...],
  "stats": {...},
  "disease_name": "Breast Cancer"
}
```

**Response:** JSON file download with complete network data

---

### GET `/protein/{gene_symbol}`
Fetch detailed protein information from STRING DB.

**Example:** `/protein/TP53`

**Response:**
```json
{
  "gene_symbol": "TP53",
  "protein_id": "9606.ENSP00000269305",
  "preferred_name": "TP53",
  "annotation": "Tumor protein p53. Acts as a tumor suppressor...",
  "ncbi_url": "https://www.ncbi.nlm.nih.gov/gene/7157",
  "uniprot_url": "https://www.uniprot.org/uniprotkb/P04637",
  "string_url": "https://string-db.org/network/9606.ENSP00000269305"
}
```

---

### GET `/drugs/{gene_symbol}`
Fetch drug-gene interactions from DGIdb.

**Example:** `/drugs/EGFR`

**Response:**
```json
{
  "gene": "EGFR",
  "druggable": true,
  "drug_count": 15,
  "drugs": [
    {
      "drug_name": "GEFITINIB",
      "interaction_types": ["inhibitor"],
      "sources": ["DrugBank", "TTD"]
    }
  ],
  "categories": ["DRUGGABLE GENOME", "CLINICALLY ACTIONABLE"],
  "dgidb_url": "https://dgidb.org/genes/EGFR"
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Activate virtual environment and run `pip install -r requirements.txt`

**Problem**: `ModuleNotFoundError: No module named 'openpyxl'`
- **Solution**: Install Excel support: `pip install openpyxl>=3.1.0`

**Problem**: Backend not accessible from frontend
- **Solution**: Ensure backend is running on port 8000 and CORS is enabled in main.py

**Problem**: STRING DB API timeout
- **Solution**: Check internet connection, try reducing number of genes, verify STRING DB is accessible

**Problem**: DGIdb API slow or timing out
- **Solution**: Normal behavior - API has 15s timeout with graceful fallback. Some genes may show "No drug interactions found"

### Frontend Issues

**Problem**: `npm install` fails
- **Solution**: Update Node.js to v18+, clear npm cache: `npm cache clean --force`

**Problem**: Port 5173 already in use
- **Solution**: Kill existing process or use different port: `npm run dev -- --port 5174`

**Problem**: Network graph not rendering
- **Solution**: Check browser console (F12) for errors, ensure backend is running, refresh page

**Problem**: "No interactions found"
- **Solution**: Try different genes, lower confidence threshold (0.3), check gene symbol spelling (use official symbols)

**Problem**: File upload fails
- **Solution**: Ensure file has genes in first column, supported format (.xlsx, .csv, .tsv), file size < 10MB

**Problem**: Export not working
- **Solution**: Generate network first before exporting, check browser allows downloads

**Problem**: Modal not opening on node click
- **Solution**: Click directly on node center, zoom in if nodes are too small, check browser console for errors

### Data Issues

**Problem**: High number of genes not found
- **Solution**: Use official gene symbols (HGNC), check spelling, try alternative names

**Problem**: Network too sparse or too dense
- **Solution**: Adjust confidence threshold (0.3-0.9), add/remove genes, try related genes

---

## 🚀 Production Deployment

### Backend Deployment

#### Option 1: Gunicorn (Linux/macOS)
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn (4 workers)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# With systemd service (Ubuntu/Debian)
sudo nano /etc/systemd/system/ppi-backend.service
# Add service configuration
sudo systemctl start ppi-backend
sudo systemctl enable ppi-backend
```

#### Option 2: Docker
```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t ppi-backend .
docker run -d -p 8000:8000 ppi-backend
```

#### Option 3: Cloud Platforms
- **Azure App Service**: Deploy as Python web app
- **AWS Elastic Beanstalk**: Python application environment
- **Google Cloud Run**: Containerized deployment
- **Railway/Render**: One-click deployment from GitHub

### Frontend Deployment

#### Build for Production
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

#### Deployment Options

**Static Hosting (Recommended):**
- **Vercel**: `npm install -g vercel` → `vercel --prod`
- **Netlify**: Drag `dist/` folder to Netlify dashboard
- **GitHub Pages**: Deploy `dist/` folder
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

**Configuration for API:**
Update API endpoint in production build:
```javascript
// In App.jsx, replace:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
// Use environment variable for production
```

**Environment Variables:**
Create `.env.production`:
```
VITE_API_URL=https://your-backend-api.com
```

### Security Considerations
- Enable HTTPS for both frontend and backend
- Set CORS allowed origins to production domains only
- Use environment variables for sensitive data
- Implement rate limiting on API endpoints
- Add API authentication if handling sensitive data
- Use secure headers (HSTS, CSP, X-Frame-Options)

### Performance Optimization
- Enable gzip compression on backend
- Use CDN for frontend assets
- Implement caching headers for static files
- Consider Redis for caching frequent STRING DB queries
- Monitor API response times with logging/metrics

---

## 📚 References

### Data Sources
- **STRING Database**: https://string-db.org/
- **DGIdb (Drug Gene Interaction Database)**: https://dgidb.org/

### Libraries & Frameworks
- **NetworkX Documentation**: https://networkx.org/
- **Cytoscape.js**: https://js.cytoscape.org/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Framer Motion**: https://www.framer.com/motion/

### Additional Documentation
- **NEW_FEATURES.md**: Comprehensive guide to new features (export, modal, drug data)
- **QUICK_START_GUIDE.md**: User guide with examples and troubleshooting

---

## 📄 License & Citation

### License
This project is released under the MIT License for educational and research purposes.

### Citation
If you use this tool in your research, please cite:

```
PPI Network Explorer v2.0 (2025)
A comprehensive protein-protein interaction network analysis platform
Features: Interactive visualization, drug target discovery, multi-format export
Data sources: STRING Database v12, DGIdb
https://github.com/[your-repo]
```

### Third-Party Data Sources
- **STRING Database**: Please cite STRING according to their guidelines at https://string-db.org/cgi/about
- **DGIdb**: Please cite DGIdb according to their guidelines at https://dgidb.org/about

---

## 🆘 Support & Contributing

### Getting Help
- **Documentation**: Check `NEW_FEATURES.md` and `QUICK_START_GUIDE.md`
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **API Docs**: Interactive documentation at `http://localhost:8000/docs`

### Contributing
Contributions are welcome! Areas for improvement:
- Additional network layout algorithms
- Pathway enrichment analysis integration
- Batch processing for multiple diseases
- Network comparison tools
- Additional export formats (GraphML, SBML)
- Integration with other biological databases

### Development Roadmap
**Planned Features:**
- [ ] Pathway enrichment analysis (KEGG, Reactome)
- [ ] Network comparison between disease states
- [ ] Batch analysis mode
- [ ] GraphML/SBML export
- [ ] Integration with Gene Ontology
- [ ] Time-series network analysis
- [ ] 3D network visualization option
- [ ] Session saving/loading
- [ ] Collaborative sharing features

---

## ⚡ Quick Reference

### Common Commands
```bash
# Backend
cd backend
source venv/Scripts/activate  # Windows Git Bash
python main.py

# Frontend  
cd frontend
npm run dev

# Production
npm run build
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Key Shortcuts
- **Upload File**: Click "Upload File" button or drag & drop (coming soon)
- **Zoom**: Mouse scroll wheel
- **Pan**: Click and drag canvas
- **Node Info**: Click any node
- **Export**: Header "Export" → Choose format

### Important URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **STRING DB**: https://string-db.org
- **DGIdb**: https://dgidb.org

### Default Configuration
- **Confidence Threshold**: 0.4 (medium-high)
- **Species**: Homo sapiens (9606)
- **Max Network Size**: Limited by browser performance (~500 nodes)
- **DGIdb Timeout**: 15 seconds
- **Export Limits**: None (full network exported)

---

## 👨‍💻 Development

### Project Structure
- **Backend**: FastAPI REST API with NetworkX analysis engine
- **Frontend**: React SPA with Vite build system
- **Communication**: JSON over HTTP with CORS enabled
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS utility classes with custom dark theme

### Key Components
- **App.jsx**: Main application logic, state management, API calls
- **NetworkGraph.jsx**: Cytoscape visualization with event handlers
- **DataPanel.jsx**: Collapsible analysis results panel
- **ProteinDetailsModal.jsx**: Protein info and drug target modal

### API Endpoints Flow
1. User inputs genes → `POST /analyze` → Network construction
2. User uploads file → `POST /upload-genes` → Gene extraction
3. User clicks node → `GET /protein/{gene}` + `GET /drugs/{gene}` → Modal display
4. User exports → `POST /export/csv` or `/export/json` → File download

### Performance Optimizations
- React component memoization
- Cytoscape layout caching
- Lazy loading for modal data
- Streaming responses for large exports
- Client-side PNG generation (no backend load)

**Version**: 2.0.0  
**Last Updated**: December 2025

---

## 🙏 Acknowledgments

- **STRING Database** team for comprehensive PPI data and API access
- **DGIdb** team for drug-gene interaction data
- **NetworkX** developers for graph analysis algorithms
- **Cytoscape.js** community for visualization tools
- **Tailwind Labs** for the CSS framework
- **Framer** for Motion animation library

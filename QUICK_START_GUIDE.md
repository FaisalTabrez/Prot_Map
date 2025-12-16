# Quick Start Guide - New Features

## 🎯 How to Use the New Features

### Starting the Application

1. **Backend** (Terminal 1):
   ```bash
   cd "c:\Volume D\Prot_Map\backend"
   venv\Scripts\activate
   python main.py
   ```
   ✅ Server runs on: http://localhost:8000

2. **Frontend** (Terminal 2):
   ```bash
   cd "c:\Volume D\Prot_Map\frontend"
   npm run dev
   ```
   ✅ App runs on: http://localhost:5173

---

## 📋 Feature 1: Export Network Data

### Steps:
1. Generate a network (enter disease + genes, click "Generate Network")
2. Click the **"Export"** button in the top-right header
3. Choose from the dropdown:
   - **CSV Report**: Best for Excel/R/Python analysis
   - **JSON Export**: Complete data for archiving
   - **PNG Image**: High-res screenshot for presentations

### What You Get:

#### CSV Export (`breast_cancer_network_export.csv`):
```
=== NODES ===
id,label,degree,betweenness,module
1,TP53,0.85,0.42,0
2,BRCA1,0.72,0.35,0

=== EDGES ===
source,target,score
TP53,BRCA1,0.998

=== HUB PROTEINS ===
protein,degree_centrality,connections
TP53,0.85,18

=== STATISTICS ===
metric,value
total_nodes,20
total_edges,156
```

#### JSON Export (`breast_cancer_network_export.json`):
```json
{
  "disease_name": "Breast Cancer",
  "timestamp": "2024-01-15T10:30:00",
  "elements": [...],
  "stats": {...}
}
```

#### PNG Export (`ppi_network.png`):
- 3x resolution (ultra-sharp)
- Dark background
- All nodes and edges visible

---

## 🔍 Feature 2: Node Details Modal

### Steps:
1. Generate a network
2. **Click any node** in the graph
3. Modal opens with two tabs:

### Tab 1: Protein Info
- **Description**: Full annotation from STRING DB
- **Protein ID**: STRING database identifier
- **External Links**:
  - 🧬 NCBI Gene - Click to view genetic information
  - 🔬 UniProt - Click to view protein details
  - 🕸️ STRING - Click to view full protein interaction network

### Tab 2: Drug Targets
Shows if the protein is druggable:

**Example: TP53**
```
✅ Druggable Target - 15 interactions

Known Drug Interactions:
┌─────────────────────────────┐
│ DOXORUBICIN                 │
│ inhibitor                   │
│ 3 sources                   │
├─────────────────────────────┤
│ PACLITAXEL                  │
│ inhibitor                   │
│ 2 sources                   │
└─────────────────────────────┘
```

**If NOT druggable:**
```
ℹ️ No drug interactions found
This protein may not be a known drug target
```

### Closing the Modal:
- Click the ✖️ button
- Click outside the modal (on the dark overlay)

---

## 🧪 Test Scenario

### Try This:
1. Load the **Breast Cancer** example (click "Load Example")
2. Click **"Generate Network"**
3. Wait for network to load
4. **Click on the TP53 node**:
   - See full protein description
   - Switch to "Drug Targets" tab
   - See 15+ drug interactions
   - Click "View all on DGIdb" link
5. **Close modal**, click **BRCA1 node**:
   - See different protein info
   - Check if it has drug targets
6. **Export the network**:
   - Click "Export" → "CSV Report"
   - Open the downloaded CSV in Excel
   - See all data sections
7. **Export PNG**:
   - Click "Export" → "PNG Image"
   - Open the downloaded image
   - Verify high quality

---

## 💡 Pro Tips

### Export Tips:
- **CSV** is best for quantitative analysis (R, Python, Excel)
- **JSON** is best for saving sessions (can reload later with custom code)
- **PNG** is best for PowerPoint, papers, posters

### Modal Tips:
- **Double-click** nodes for faster access
- Keep modal open while exploring other tabs
- Use external links to deep-dive into specific proteins
- Drug data comes from DGIdb - may take a moment to load

### Network Analysis Workflow:
1. Generate network
2. Identify hub proteins (large nodes)
3. Click hubs to check drug targets
4. Export CSV for statistical analysis
5. Export PNG for presentation
6. Share JSON with collaborators

---

## 🐛 Troubleshooting

### Export Not Working?
- **Check**: Did you generate a network first?
- **Solution**: Click "Generate Network" before exporting

### Modal Not Opening?
- **Check**: Did you click directly on a node (not the canvas)?
- **Solution**: Zoom in and click the center of a node

### Drug Data Shows "No interactions found"
- **Possible causes**:
  1. Protein is not a known drug target (normal)
  2. DGIdb API is slow/down (check internet)
- **Solution**: Try another protein, or wait and retry

### PNG Export is Blurry
- **Cause**: Browser zoom level
- **Solution**: Reset browser zoom to 100%

### CSV Won't Open in Excel
- **Cause**: File path has spaces
- **Solution**: Move file to simple path like `C:\Downloads\`

---

## 📞 Support

If you encounter issues:
1. Check backend terminal for error messages
2. Check browser console (F12) for JavaScript errors
3. Verify both servers are running (backend: 8000, frontend: 5173)
4. Try refreshing the page (Ctrl+R)

---

## 🎓 Advanced Usage

### Programmatic CSV Analysis (Python):
```python
import pandas as pd

# Read the exported CSV
with open('breast_cancer_network_export.csv', 'r') as f:
    content = f.read()

# Parse nodes section
nodes_section = content.split('=== NODES ===')[1].split('=== EDGES ===')[0]
import io
nodes_df = pd.read_csv(io.StringIO(nodes_section.strip()))

# Top 10 hubs
top_hubs = nodes_df.nlargest(10, 'degree')
print(top_hubs)
```

### Programmatic JSON Analysis (Python):
```python
import json

with open('breast_cancer_network_export.json', 'r') as f:
    data = json.load(f)

print(f"Network: {data['disease_name']}")
print(f"Nodes: {data['stats']['total_nodes']}")
print(f"Edges: {data['stats']['total_edges']}")

# Extract node list
nodes = [el['data']['label'] for el in data['elements'] if 'source' not in el['data']]
print(f"Proteins: {', '.join(nodes[:10])}...")
```

---

Enjoy exploring your protein interaction networks! 🧬✨

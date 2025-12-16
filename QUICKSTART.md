# 🚀 QUICK START GUIDE - PPI Network Explorer

## ⚡ Fast Setup (5 minutes)

### Step 1: Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python main.py
```
✅ Backend: http://localhost:8000

---

### Step 2: Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (one-time)
npm install

# Start development server
npm run dev
```
✅ Frontend: http://localhost:5173

---

## 🧪 Test with Example

1. Open http://localhost:5173
2. Click **"Load Example (Breast Cancer)"**
3. Click **"Construct & Analyze Network"**
4. Wait 5-10 seconds for analysis
5. Explore the interactive network graph!

---

## 📋 What You Should See

### Network Graph (Left)
- Colorful nodes (different sizes)
- Nodes connected by edges
- Interactive (click, drag, zoom)

### Analysis Panel (Right)
- Top 5 Hub Proteins
- Top 5 Bottleneck Proteins
- Network statistics

---

## ⚠️ Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.8+)
- Make sure venv is activated

**Frontend won't start?**
- Check Node version: `node --version` (need 18+)
- Delete node_modules and run `npm install` again

**"No interactions found"?**
- Try the example button first
- Check that backend is running
- Ensure genes are valid symbols (TP53, BRCA1, etc.)

---

## 🎯 Next Steps

- Try your own gene list (copy from DisGeNET)
- Adjust confidence threshold in the code
- Export results (feature coming soon)
- Read the full README.md for detailed documentation

---

**Happy Network Analysis! 🧬**

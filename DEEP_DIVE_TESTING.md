# 🧬 Deep Dive Feature - Testing Guide

## ✅ Setup Complete!

The Deep Dive feature has been successfully implemented and the database has been migrated.

---

## 🚀 Current Status

- ✅ Backend running on http://localhost:8000
- ✅ Database schema updated with `extended_data` column
- ✅ New endpoint: `GET /gene/{symbol}/details`
- ✅ Frontend components ready

---

## 🧪 How to Test

### Step 1: Generate a Network
1. Open http://localhost:5173 (make sure frontend is running)
2. Enter a disease: `Breast Cancer`
3. Enter genes: `TP53 BRCA1 EGFR ERBB2 PIK3CA`
4. Click **"Generate Network"**

### Step 2: Click a Gene Node
1. **Click on any gene node** in the network (e.g., TP53, EGFR)
2. Watch the sidebar slide in from the right
3. **First click**: You'll see a loading spinner for ~1-2 seconds (Gemini AI fetching data)
4. **Data appears**:
   - Full gene name
   - Function summary
   - Disease relevance
   - Drug badges (cyan pills)
   - Clinical significance (color-coded badge)

### Step 3: Test Caching
1. Close the panel (X button)
2. **Click the same gene again**
3. **Result**: Instant response (no loading) - data served from database cache

---

## 🎨 Expected UI

```
┌────────────────────────────────────────┐
│  [X]  EGFR                             │
│       Epidermal Growth Factor Receptor │
│       [Loaded from cache]              │
├────────────────────────────────────────┤
│  Clinical Significance: [High]         │
│                                        │
│  ⚡ Function                           │
│  ┌──────────────────────────────────┐ │
│  │ Receptor tyrosine kinase...      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ⚠️  Disease Relevance                │
│  ┌──────────────────────────────────┐ │
│  │ Mutations in EGFR are found...   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  💊 Known Drug Interactions           │
│  [Gefitinib] [Erlotinib] [Cetuximab] │
│  [Osimertinib] [Afatinib]             │
│                                        │
│  Information powered by AI            │
└────────────────────────────────────────┘
```

---

## 🔍 API Testing (Optional)

Test the endpoint directly:

```bash
curl http://localhost:8000/gene/TP53/details | jq
```

Expected response:
```json
{
  "symbol": "TP53",
  "full_name": "Tumor Protein p53",
  "function_summary": "Acts as a tumor suppressor...",
  "disease_relevance": "Mutations in TP53 are found...",
  "known_drugs": ["APR-246", "COTI-2", "Kevetrin", ...],
  "clinical_significance": "High",
  "cached": false  // true on subsequent calls
}
```

---

## 🎯 Success Criteria

- ✅ Sidebar slides in smoothly
- ✅ First click shows loading spinner
- ✅ Data displays correctly with drug badges
- ✅ Second click is instant (cached)
- ✅ Close button works
- ✅ Multiple genes can be clicked

---

## 🐛 Troubleshooting

### Issue: "Gene not found in database"
**Solution**: The gene must be in your network first. Only genes that have been analyzed appear in the database.

### Issue: Panel doesn't slide in
**Solution**: Check browser console for errors. Ensure frontend is running.

### Issue: API error 503
**Solution**: Check that Gemini API key is set in backend/.env

---

## 📊 Performance Expectations

| Scenario | Expected Response Time |
|----------|----------------------|
| First click (cache miss) | ~1.5 - 2 seconds |
| Subsequent clicks (cached) | < 100ms (instant) |
| Panel animation | 300ms smooth slide |

---

## 🎉 Enjoy Your Deep Dive Feature!

Click any gene in your network and explore comprehensive clinical insights powered by AI! 🧬✨

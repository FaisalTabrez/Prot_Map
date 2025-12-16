# 🎨 BioNet Explorer - Dashboard Redesign Guide

## Installation Commands

### Install New Frontend Dependencies

Run this command in the `frontend/` directory:

```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

**Or install all dependencies from scratch:**

```bash
cd frontend
npm install
```

---

## What's New?

### 🎯 Design Changes

#### 1. **Dark "Cyber-Biology" Theme**
- **Background**: Slate-950 (#020617)
- **Panels**: Slate-900 (#0f172a) with glassmorphic effects
- **Accents**: Emerald-500 (#10b981) for primary actions
- **Grid Background**: Subtle emerald grid pattern on graph canvas

#### 2. **Three-Panel Layout**

**Left Sidebar (320px)**
- BioNet Explorer branding with DNA icon
- Gene input textarea
- Generate Network button (with loading state)
- Network statistics cards (animated)
- Powered by STRING DB footer

**Main Canvas (Flex-1)**
- Glassmorphic floating header with editable disease name
- Export Report button
- Full-height Cytoscape graph with dark theme
- Grid background effect
- Zoom controls (bottom-right)
- Visual legend (top-left)

**Right Data Panel (384px, collapsible)**
- Animated slide-in from right
- Three tabs: Top Hubs, Bottlenecks, Modules
- Styled tables with gradients
- Progress bars for metrics
- Collapse/expand toggle

---

## New Libraries Explained

### 1. **framer-motion**
- Provides smooth animations for layout transitions
- Used for: sidebar slide-in, panel animations, button hover effects
- Example: `<motion.div initial={{ x: -320 }} animate={{ x: 0 }}>`

### 2. **lucide-react**
- Modern, clean icon library
- Icons used: `Dna`, `Network`, `Activity`, `Download`, `Target`, `Link2`, `Grid3x3`, `ZoomIn`, `ZoomOut`, etc.
- Example: `<Dna className="w-6 h-6 text-emerald-400" />`

### 3. **clsx** + **tailwind-merge**
- Clean class name management
- Prevents Tailwind class conflicts
- Usage via utility function: `cn("base-class", condition && "conditional-class")`

---

## File Structure

```
frontend/src/
├── App.jsx                    # Main dashboard layout
├── components/
│   ├── NetworkGraph.jsx       # Dark-themed Cytoscape graph
│   ├── DataPanel.jsx          # Right panel with tabs
│   └── AnalysisPanel.jsx      # (Old, no longer used)
├── lib/
│   └── utils.js               # cn() utility for class merging
├── App.css                    # Grid background, dimmed effect, scrollbar
└── index.css                  # Dark theme globals, Inter font
```

---

## Key Features

### ✨ Animations

1. **Sidebar**: Slides in from left on load (`initial={{ x: -320 }}`)
2. **Data Panel**: Slides in from right when results are ready
3. **Buttons**: Scale on hover (`whileHover={{ scale: 1.05 }}`)
4. **Stats Cards**: Fade up with delay
5. **Progress Bars**: Animated width transitions

### 🎨 Styling Highlights

**Glassmorphic Header:**
```jsx
className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
```

**Gradient Buttons:**
```jsx
className="bg-gradient-to-r from-emerald-600 to-emerald-500"
```

**Glow Effects on Nodes:**
- Shadow blur with module color
- Enhanced on selection

### 🖱️ Interactive Elements

1. **Node Selection**: Highlights connected nodes and edges
2. **Zoom Controls**: +, -, Fit buttons (bottom-right)
3. **Collapsible Panel**: Minimize data panel to save space
4. **Editable Disease Name**: Click to edit in header
5. **Tab Navigation**: Switch between Hubs/Bottlenecks/Modules

---

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Slate-950 | #020617 | Main canvas |
| Sidebar | Slate-900 | #0f172a | Left panel |
| Borders | Slate-800 | #1e293b | Dividers |
| Text Primary | Slate-100 | #f1f5f9 | Main text |
| Text Secondary | Slate-400 | #94a3b8 | Labels |
| Accent Primary | Emerald-500 | #10b981 | Buttons, highlights |
| Accent Secondary | Cyan-400 | #22d3ee | Stats cards |
| Error | Red-500 | #ef4444 | Error messages |

---

## Running the Redesigned App

### 1. Start Backend (Terminal 1)
```bash
cd backend
python main.py
```
✅ Backend: http://localhost:8000

### 2. Install New Dependencies (Terminal 2)
```bash
cd frontend
npm install
```

### 3. Start Frontend
```bash
npm run dev
```
✅ Frontend: http://localhost:5173

---

## What to Expect

### On Load
- Sidebar slides in from left with smooth animation
- Dark gradient background with subtle grid
- Empty state message: "No Network Generated"

### After Clicking "Generate Network"
- Loading spinner in button
- API call to backend
- Network animates into view
- Data panel slides in from right
- Stats cards fade in on sidebar

### Interactions
- Click nodes to highlight connections (others dim)
- Use zoom controls to navigate graph
- Switch tabs in data panel
- Collapse/expand data panel
- Edit disease name in header
- Click Export Report (placeholder)

---

## Customization Tips

### Change Theme Colors

**Primary Accent (Emerald → Purple):**
```jsx
// In App.jsx, replace:
from-emerald-600 to-emerald-500
// With:
from-purple-600 to-purple-500
```

**Update Grid Color:**
```css
/* In App.css */
background-image: 
  linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
```

### Adjust Panel Widths

```jsx
// Sidebar width
className="w-80"  // Change to w-64, w-96, etc.

// Data panel width
className="w-96"  // Change to w-80, w-[500px], etc.
```

---

## Troubleshooting

### Issue: Icons not showing
**Solution**: Ensure `lucide-react` is installed:
```bash
npm install lucide-react
```

### Issue: Animations not smooth
**Solution**: Ensure `framer-motion` is installed:
```bash
npm install framer-motion
```

### Issue: Tailwind classes not working
**Solution**: Check `tailwind.config.js` content paths:
```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

### Issue: Graph not visible
**Solution**: Check browser console for Cytoscape errors. Ensure backend is running and returning data.

---

## Performance Notes

- **Large Networks (100+ nodes)**: Graph rendering may slow down. Consider reducing animation duration in COSE layout.
- **Mobile**: Sidebar is fixed at 320px, may need responsive breakpoints for mobile views.
- **Backdrop Blur**: May impact performance on older devices. Can be reduced or removed.

---

## Next Steps

### Suggested Enhancements

1. **Export Functionality**: Implement actual CSV/JSON download
2. **Node Details Modal**: Show full protein info on double-click
3. **Search**: Add search bar to find specific genes in graph
4. **Filters**: Filter by module, degree threshold, etc.
5. **Themes**: Add light mode toggle
6. **Mobile Responsive**: Collapsible sidebar on mobile

---

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (may have backdrop-blur issues)
- ⚠️ IE11 (not supported - uses modern CSS)

---

**Enjoy your new professional scientific dashboard! 🧬✨**

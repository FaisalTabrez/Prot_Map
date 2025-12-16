import { useEffect, useRef, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import ProteinDetailsModal from './ProteinDetailsModal'

/**
 * NetworkGraph Component - Dark Theme Edition with Database-Driven Coloring
 * ==========================================================================
 * Renders an interactive PPI network using Cytoscape.js with cyber-biology aesthetics
 * 
 * Visual Encoding:
 * - Node Size: Proportional to degree centrality (hub proteins are larger)
 * - Node Color: Mapped to biological function from SQL database
 * - Layout: COSE (physics-based) for natural clustering
 */

// Biological function color palette (Neon/Glossy style for dark theme)
const FUNCTION_COLORS = {
  'Tumor Suppressor': '#ff3333',      // Neon Red
  'Oncogene': '#00ff88',              // Neon Green
  'Kinase': '#ffaa00',                // Neon Orange
  'Transcription Factor': '#bc13fe',  // Neon Purple
  'Unknown': '#64748b',               // Slate Grey (fallback)
}

// Fallback module colors for uncategorized genes
const MODULE_COLORS = [
  '#4CC9F0', // Neon Cyan
  '#F72585', // Neon Pink
  '#7209B7', // Purple
]

/**
 * Get node color based on biological function category from database
 * Falls back to module-based coloring if category is Unknown
 */
function getNodeColor(category, moduleId) {
  if (category && category !== 'Unknown' && FUNCTION_COLORS[category]) {
    return FUNCTION_COLORS[category]
  }
  // Fallback to module-based coloring
  if (moduleId !== undefined && moduleId < MODULE_COLORS.length) {
    return MODULE_COLORS[moduleId]
  }
  return FUNCTION_COLORS['Unknown']
}

function NetworkGraph({ elements }) {
  const cyRef = useRef(null)
  const [selectedGene, setSelectedGene] = useState(null)

  /**
   * Cytoscape.js stylesheet - Dark theme optimized
   */
  const stylesheet = [
    // Node styling - Bioluminescent, glossy, vibrant on deep-black background
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '11px',
        'font-weight': '700',
        'color': '#ffffff', // white labels for contrast
        'text-outline-width': 2,
        'text-outline-color': '#000000', // subtle outline for readability

        // Size based on degree centrality (keep original mapping)
        'width': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(35, Math.min(90, 35 + degree * 120))
        },
        'height': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(35, Math.min(90, 35 + degree * 120))
        },

        // Color mapping: use category from database, fallback to module
        'background-color': (ele) => {
          const category = ele.data('category')
          const moduleId = ele.data('module')
          return getNodeColor(category, moduleId)
        },

        // Glossy white highlight border
        'border-width': 2,
        'border-color': '#ffffff',
        'border-opacity': 0.95,

        // Glow effect tuned for black background
        'shadow-blur': (ele) => {
          const degree = ele.data('degree') || 0
          return 10 + Math.min(40, Math.floor(degree * 50))
        },
        'shadow-color': (ele) => {
          const category = ele.data('category')
          const moduleId = ele.data('module')
          return getNodeColor(category, moduleId)
        },
        'shadow-opacity': 0.85,
      }
    },

    // Dimmed class for unfocused elements
    {
      selector: '.dimmed',
      style: {
        'opacity': 0.12,
        'transition-property': 'opacity',
        'transition-duration': '200ms'
      }
    },

    // Edge styling - thin optical-fiber look
    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': '#ffffff',
        'opacity': 0.28,
        'curve-style': 'bezier',
        'target-arrow-shape': 'none'
      }
    },

    // Selected node: bright yellow and expanded glow/size
    {
      selector: 'node:selected',
      style: {
        'background-color': '#FFD60A',
        'border-color': '#ffffff',
        'border-width': 3,
        'shadow-blur': 48,
        'shadow-color': '#FFD60A',
        'shadow-opacity': 1,
        // increase size slightly while preserving degree mapping
        'width': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(45, Math.min(110, 45 + degree * 150))
        },
        'height': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(45, Math.min(110, 45 + degree * 150))
        },
        'label': 'data(label)'
      }
    },

    // Selected edge emphasis
    {
      selector: 'edge:selected',
      style: {
        'width': 2,
        'line-color': '#FFD60A',
        'opacity': 0.9,
        'shadow-blur': 12,
        'shadow-color': '#FFD60A',
        'shadow-opacity': 0.6
      }
    }
    ,
    // Pulse class used for entry animation (pulsing glow)
    {
      selector: 'node.pulse',
      style: {
        'shadow-blur': 60,
        'shadow-color': '#FFD60A',
        'shadow-opacity': 1,
        'border-color': '#ffffff',
        'border-width': 3
      }
    }
  ]

  /**
   * COSE Layout Configuration
   */
  const layout = {
    name: 'cose',
    animate: true,
    animationDuration: 1500,
    animationEasing: 'ease-out',
    
    // Physics simulation
    nodeRepulsion: 10000,
    idealEdgeLength: 120,
    edgeElasticity: 100,
    nestingFactor: 1.2,
    gravity: 0.8,
    
    // Performance
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  }

  /**
   * Add interactivity
   */
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current

      // Console logging on hover
      cy.on('mouseover', 'node', (event) => {
        const node = event.target
        const data = node.data()
        console.log(`🧬 ${data.label}:`, {
          degree: data.node_degree,
          betweenness: data.betweenness,
          module: data.module
        })
      })

      // Open modal on node tap/click
      cy.on('tap', 'node', (event) => {
        const node = event.target
        const geneSymbol = node.data('label')
        setSelectedGene(geneSymbol)
      })

      // Highlight connected nodes
      cy.on('select', 'node', (event) => {
        const node = event.target
        const connectedEdges = node.connectedEdges()
        const connectedNodes = connectedEdges.connectedNodes()
        
        cy.elements().addClass('dimmed')
        node.removeClass('dimmed')
        connectedEdges.removeClass('dimmed')
        connectedNodes.removeClass('dimmed')
      })

      cy.on('unselect', 'node', () => {
        cy.elements().removeClass('dimmed')
      })

      // Listen for export PNG event
      const handleExportPNG = () => {
        if (cy) {
          const png = cy.png({
            output: 'blob',
            bg: '#020617', // slate-950
            full: true,
            scale: 3
          })
          const url = URL.createObjectURL(png)
          const a = document.createElement('a')
          a.href = url
          a.download = 'ppi_network.png'
          document.body.appendChild(a)
          a.click()
          URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }

      window.addEventListener('exportGraphPNG', handleExportPNG)

      // --- Node pulsing entry animation ---
      const pulseTimeouts = new Map()

      const startPulsing = () => {
        const nodes = cy.nodes()
        nodes.forEach((n, i) => {
          const delay = i * 80
          // Stagger a single pulse per node on initial layout
          const start = setTimeout(() => {
            n.addClass('pulse')
            // remove pulse after animation duration
            const end = setTimeout(() => n.removeClass('pulse'), 700)
            pulseTimeouts.set(`${n.id()}_end`, end)
          }, delay)

          pulseTimeouts.set(`${n.id()}_start`, start)
        })
      }

      // Start pulsing after layout finishes (so nodes are in place)
      cy.on('layoutstop', startPulsing)

      return () => {
        window.removeEventListener('exportGraphPNG', handleExportPNG)
        try {
          cy.removeListener('layoutstop', startPulsing)
        } catch (e) {}
        // Clear any active timeouts
        for (const [k, v] of pulseTimeouts.entries()) {
          try { clearTimeout(v) } catch (e) {}
        }
      }
    }
  }, [elements])

  // Zoom controls
  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
      cyRef.current.center()
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
      cyRef.current.center()
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50)
    }
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black" style={{ backgroundColor: '#000000' }}>
      <CytoscapeComponent
        elements={elements}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000000', // Deep black background
        }}
        stylesheet={stylesheet}
        layout={layout}
        cy={(cy) => { cyRef.current = cy }}
        wheelSensitivity={0.2}
      />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleZoomIn}
          className="p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-emerald-400 shadow-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleZoomOut}
          className="p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-emerald-400 shadow-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFit}
          className="p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-emerald-400 shadow-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Function-Based Color Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg border border-white/10 rounded-lg p-3 shadow-2xl">
        <h4 className="text-xs font-bold text-white/90 mb-2">Gene Functions</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: FUNCTION_COLORS.TUMOR_SUPPRESSOR, boxShadow: `0 0 8px ${FUNCTION_COLORS.TUMOR_SUPPRESSOR}` }}></div>
            <span className="text-white/80">Tumor Suppressor / DNA Repair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: FUNCTION_COLORS.ONCOGENE, boxShadow: `0 0 8px ${FUNCTION_COLORS.ONCOGENE}` }}></div>
            <span className="text-white/80">Oncogene / Growth Factor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: FUNCTION_COLORS.KINASE, boxShadow: `0 0 8px ${FUNCTION_COLORS.KINASE}` }}></div>
            <span className="text-white/80">Kinase / Signaling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: FUNCTION_COLORS.CELL_CYCLE, boxShadow: `0 0 8px ${FUNCTION_COLORS.CELL_CYCLE}` }}></div>
            <span className="text-white/80">Cell Cycle / Transcription</span>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-white/10 text-emerald-400 text-[10px]">
            💡 Node size = Degree centrality
          </div>
        </div>
      </div>

      {/* Protein Details Modal */}
      {selectedGene && (
        <ProteinDetailsModal
          gene={selectedGene}
          onClose={() => setSelectedGene(null)}
        />
      )}
    </div>
  )
}

export default NetworkGraph

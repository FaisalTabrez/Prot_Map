import { useEffect, useRef, useState } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import ProteinDetailsModal from './ProteinDetailsModal'

/**
 * NetworkGraph Component - Dark Theme Edition
 * ============================================
 * Renders an interactive PPI network using Cytoscape.js with cyber-biology aesthetics
 * 
 * Visual Encoding:
 * - Node Size: Proportional to degree centrality (hub proteins are larger)
 * - Node Color: Mapped to module/cluster ID (functional grouping)
 * - Layout: COSE (physics-based) for natural clustering
 */

// Vibrant color palette for dark theme
const MODULE_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
]

function NetworkGraph({ elements }) {
  const cyRef = useRef(null)
  const [selectedGene, setSelectedGene] = useState(null)

  /**
   * Cytoscape.js stylesheet - Dark theme optimized
   */
  const stylesheet = [
    // Node styling
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '11px',
        'font-weight': 'bold',
        'color': '#f1f5f9', // Slate-100
        'text-outline-width': 3,
        'text-outline-color': '#0f172a', // Slate-900
        
        // Size based on degree centrality
        'width': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(35, Math.min(90, 35 + degree * 120))
        },
        'height': (ele) => {
          const degree = ele.data('degree') || 0
          return Math.max(35, Math.min(90, 35 + degree * 120))
        },
        
        // Color based on module
        'background-color': (ele) => {
          const module = ele.data('module') || 0
          return MODULE_COLORS[module % MODULE_COLORS.length]
        },
        
        'border-width': 3,
        'border-color': '#1e293b', // Slate-800
        'border-opacity': 0.8,
        
        // Glow effect
        'shadow-blur': 15,
        'shadow-color': (ele) => {
          const module = ele.data('module') || 0
          return MODULE_COLORS[module % MODULE_COLORS.length]
        },
        'shadow-opacity': 0.6,
      }
    },
    
    // Edge styling - Dark theme
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#475569', // Slate-600
        'target-arrow-color': '#475569',
        'curve-style': 'bezier',
        'opacity': 0.4,
      }
    },
    
    // Hover effects
    {
      selector: 'node:selected',
      style: {
        'border-width': 5,
        'border-color': '#10b981', // Emerald-500
        'overlay-opacity': 0.3,
        'overlay-color': '#10b981',
        'shadow-blur': 25,
        'shadow-opacity': 0.8,
      }
    },
    
    // Connected edges on hover
    {
      selector: 'edge:selected',
      style: {
        'width': 4,
        'line-color': '#10b981',
        'opacity': 0.9,
        'shadow-blur': 10,
        'shadow-color': '#10b981',
        'shadow-opacity': 0.5,
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

      return () => {
        window.removeEventListener('exportGraphPNG', handleExportPNG)
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
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#020617', // Slate-950
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

      {/* Legend */}
      <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 shadow-lg max-w-xs">
        <h4 className="text-sm font-bold text-slate-200 mb-3">Visual Guide</h4>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50"></div>
            <span>Larger nodes = More connections (Hubs)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODULE_COLORS[0] }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODULE_COLORS[1] }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODULE_COLORS[2] }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODULE_COLORS[3] }}></div>
            </div>
            <span>Colors = Functional modules</span>
          </div>
          <div className="pt-2 border-t border-slate-700/50 text-emerald-400">
            💡 Click nodes for details
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

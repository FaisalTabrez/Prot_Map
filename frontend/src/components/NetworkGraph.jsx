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

        // Bioluminescent color mapping: hubs, bottlenecks, regular nodes
        'background-color': (ele) => {
          const degree = ele.data('degree') || 0
          const betweenness = ele.data('betweenness') || 0
          // Determine hubs by degree threshold, bottlenecks by betweenness
          if (degree >= 0.6) return '#F72585' // Neon Pink/Magenta for hubs
          if (betweenness >= 0.18) return '#7209B7' // Vibrant Purple for bottlenecks
          return '#4CC9F0' // Electric Blue/Cyan for regular nodes
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
          const degree = ele.data('degree') || 0
          const betweenness = ele.data('betweenness') || 0
          if (degree >= 0.6) return '#F72585'
          if (betweenness >= 0.18) return '#7209B7'
          return '#4CC9F0'
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
      const pulseIntervals = new Map()

      const startPulsing = () => {
        const nodes = cy.nodes()
        nodes.forEach((n, i) => {
          const delay = i * 80
          // Stagger initial pulses for premium feel
          const start = setTimeout(() => {
            // initial pulse
            n.addClass('pulse')
            setTimeout(() => n.removeClass('pulse'), 600)

            // then periodic pulsing
            const id = setInterval(() => {
              n.addClass('pulse')
              setTimeout(() => n.removeClass('pulse'), 600)
            }, 1200)

            pulseIntervals.set(n.id(), id)
          }, delay)

          pulseIntervals.set(`${n.id()}_start`, start)
        })
      }

      // Start pulsing after layout finishes (so nodes are in place)
      cy.on('layoutstop', startPulsing)

      return () => {
        window.removeEventListener('exportGraphPNG', handleExportPNG)
        try {
          cy.removeListener('layoutstop', startPulsing)
        } catch (e) {}
        // Clear any active intervals/timeouts
        for (const [k, v] of pulseIntervals.entries()) {
          try {
            clearInterval(v)
          } catch (e) {}
          try {
            clearTimeout(v)
          } catch (e) {}
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

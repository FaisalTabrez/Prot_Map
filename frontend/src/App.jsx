import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Network, Activity, Download, ChevronRight, Loader2, BarChart3, X, Upload, FileText, AlertCircle, FileDown, FileJson, Image } from 'lucide-react'
import NetworkGraph from './components/NetworkGraph'
import DataPanel from './components/DataPanel'
import { cn } from './lib/utils'
import './App.css'

/**
 * BioNet Explorer - Professional Scientific Dashboard
 * ====================================================
 * A comprehensive dark-mode PPI network analysis platform with animations and modern UI
 * 
 * Design Philosophy: "Cyber-Biology" - merging cutting-edge tech aesthetics with biological research
 */

function App() {
  // Application state
  const [geneInput, setGeneInput] = useState('')
  const [diseaseInput, setDiseaseInput] = useState('')
  const [diseaseName, setDiseaseName] = useState('Disease Network')
  const [networkData, setNetworkData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [genesNotFound, setGenesNotFound] = useState([])
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  /**
   * Handle network construction and analysis
   */
  const handleAnalyze = async () => {
    setError(null)
    setNetworkData(null)
    setStats(null)
    setShowDataPanel(false)
    setGenesNotFound([])

    // Validate disease name
    if (!diseaseInput.trim()) {
      setError('Please enter a disease or condition name')
      return
    }

    // Parse gene input
    const genes = geneInput
      .split(/[\n,\s]+/)
      .map(g => g.trim())
      .filter(g => g.length > 0)

    if (genes.length === 0) {
      setError('Please enter at least one gene symbol')
      return
    }

    if (genes.length < 2) {
      setError('Please enter at least 2 genes to build a network')
      return
    }

    // Set the disease name for the header
    setDiseaseName(diseaseInput.trim())

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genes: genes,
          confidence_threshold: 0.4
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const data = await response.json()

      if (data.elements.length === 0) {
        setError('No interactions found. Try adding more genes or different gene symbols.')
        setGenesNotFound(data.genes_not_found || genes)
        return
      }

      setNetworkData(data.elements)
      setStats(data.stats)
      setGenesNotFound(data.genes_not_found || [])
      setShowDataPanel(true)

    } catch (err) {
      setError(err.message || 'Failed to connect to backend. Ensure the API is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load example dataset
   */
  const loadExample = () => {
    const exampleGenes = `TP53 BRCA1 BRCA2 EGFR ERBB2 ESR1 PIK3CA AKT1 PTEN MYC CCND1 RB1 CDK4 CDKN2A ATM CHEK2 PALB2 RAD51 BARD1 NBN`
    setGeneInput(exampleGenes)
    setDiseaseInput('Breast Cancer')
  }

  /**
   * Export network data - CSV format
   */
  const handleExportCSV = async () => {
    if (!networkData || !stats) {
      alert('No network data to export. Please analyze a gene set first.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements: networkData,
          stats: stats
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${diseaseName.replace(/\s+/g, '_')}_network_export.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
  }

  /**
   * Export network data - JSON format
   */
  const handleExportJSON = async () => {
    if (!networkData || !stats) {
      alert('No network data to export. Please analyze a gene set first.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/export/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements: networkData,
          stats: stats,
          disease_name: diseaseName
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${diseaseName.replace(/\s+/g, '_')}_network_export.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
  }

  /**
   * Export graph as PNG image
   */
  const handleExportPNG = () => {
    if (!networkData) {
      alert('No network to export. Please analyze a gene set first.')
      return
    }

    // This will be handled by NetworkGraph component
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('exportGraphPNG'))
  }

  /**
   * Handle file upload for gene list
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/upload-genes', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'File upload failed')
      }

      const data = await response.json()
      setGeneInput(data.genes.join('\n'))
      setUploadedFileName(file.name)
      
      // Prompt user to enter disease name if not already set
      if (!diseaseInput.trim()) {
        setDiseaseInput('Uploaded Gene Set')
      }
      
      // Show success message briefly
      const successMsg = `✓ Loaded ${data.count} genes from ${file.name}`
      console.log(successMsg)
      
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden flex">
      
      {/* ================================================================= */}
      {/* SIDEBAR - Left Panel */}
      {/* ================================================================= */}
      <motion.aside
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Dna className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                BioNet Explorer
              </h1>
              <p className="text-xs text-slate-400">PPI Network Analysis</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Disease/Condition Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Disease / Condition Name
              <span className="text-red-400 text-xs">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Enter the disease or condition being studied
            </p>
            <input
              type="text"
              className={cn(
                "w-full px-3 py-2 bg-slate-800/50 border rounded-lg",
                "text-sm text-slate-200 placeholder-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent",
                "transition-all duration-200",
                error && !diseaseInput.trim() ? "border-red-500/50" : "border-slate-700"
              )}
              placeholder="e.g., Breast Cancer, Alzheimer's Disease..."
              value={diseaseInput}
              onChange={(e) => setDiseaseInput(e.target.value)}
            />
          </div>

          {/* Gene Seeds Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              Gene Seeds
              <span className="text-red-400 text-xs">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Enter gene symbols (space or comma separated) or upload a file
            </p>
            <textarea
              className={cn(
                "w-full h-40 px-3 py-2 bg-slate-800/50 border rounded-lg",
                "text-sm font-mono text-slate-200 placeholder-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent",
                "resize-none transition-all duration-200",
                error ? "border-red-500/50" : "border-slate-700"
              )}
              placeholder="TP53 BRCA1 EGFR AKT1 PTEN..."
              value={geneInput}
              onChange={(e) => setGeneInput(e.target.value)}
            />
            
            {/* File Upload Button */}
            <div className="mt-3">
              <label className="block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.txt,.tab"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload File (Excel, CSV, TSV)
                </motion.div>
              </label>
              {uploadedFileName && (
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {uploadedFileName}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={loading}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-semibold",
                "flex items-center justify-center gap-2",
                "transition-all duration-200 shadow-lg",
                loading 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/20"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Generate Network
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadExample}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Load Example (Breast Cancer)
            </motion.button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">Error</p>
                    <p className="text-xs text-red-300/80 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Summary Cards */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Network Statistics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-400">{stats.total_nodes}</div>
                    <div className="text-xs text-slate-400">Nodes</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-400">{stats.total_edges}</div>
                    <div className="text-xs text-slate-400">Edges</div>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">{stats.modules_detected}</div>
                    <div className="text-xs text-slate-400">Functional Modules</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Genes Not Found Warning */}
          <AnimatePresence>
            {genesNotFound.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  Genes Not Found ({genesNotFound.length})
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs text-amber-200/80 mb-2">
                    These genes had no interactions in STRING DB:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {genesNotFound.map((gene, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-xs font-mono text-amber-300"
                      >
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">Powered by STRING DB v12</p>
        </div>
      </motion.aside>

      {/* ================================================================= */}
      {/* MAIN CANVAS - Center/Right */}
      {/* ================================================================= */}
      <main className="flex-1 relative overflow-hidden">
        {/* Glassmorphic Header */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl px-6 py-3 shadow-2xl">
            <div className="text-xl font-bold text-slate-100">
              {diseaseName}
            </div>
          </div>

          {networkData && (
            <div className="relative">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 rounded-xl text-slate-100 font-medium shadow-2xl transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>

              {/* Export Dropdown Menu */}
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30"
                  >
                    <button
                      onClick={() => {
                        handleExportCSV()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 text-left transition-colors"
                    >
                      <FileDown className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">CSV Report</div>
                        <div className="text-xs text-slate-500">Nodes, edges, statistics</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleExportJSON()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 text-left transition-colors border-t border-slate-800"
                    >
                      <FileJson className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">JSON Export</div>
                        <div className="text-xs text-slate-500">Complete network data</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        handleExportPNG()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 text-left transition-colors border-t border-slate-800"
                    >
                      <Image className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">PNG Image</div>
                        <div className="text-xs text-slate-500">Network visualization</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Graph Area with Grid Background */}
        <div className="absolute inset-0 bg-slate-950 graph-grid">
          {networkData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-full h-full pt-24 px-6 pb-6"
            >
              <NetworkGraph elements={networkData} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="inline-block p-6 bg-slate-900/50 rounded-2xl border border-slate-800 mb-4">
                  <Network className="w-16 h-16 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-400 mb-2">No Network Generated</h3>
                <p className="text-sm text-slate-600">Enter gene seeds and click "Generate Network"</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* ================================================================= */}
      {/* DATA PANEL - Right Overlay */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showDataPanel && stats && (
          <DataPanel 
            stats={stats} 
            onClose={() => setShowDataPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

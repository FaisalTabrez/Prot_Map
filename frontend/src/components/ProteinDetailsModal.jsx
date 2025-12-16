import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Pill, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../lib/utils'

/**
 * ProteinDetailsModal Component
 * ==============================
 * Displays detailed information about a selected protein/gene
 * Features: Protein info, drug interactions, external links
 */

function ProteinDetailsModal({ gene, onClose }) {
  const [proteinData, setProteinData] = useState(null)
  const [drugData, setDrugData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch protein details
        const proteinResponse = await fetch(`http://localhost:8000/protein/${gene}`)
        if (proteinResponse.ok) {
          const proteinJson = await proteinResponse.json()
          setProteinData(proteinJson)
        }

        // Fetch drug interactions
        const drugResponse = await fetch(`http://localhost:8000/drugs/${gene}`)
        if (drugResponse.ok) {
          const drugJson = await drugResponse.json()
          setDrugData(drugJson)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (gene) {
      fetchData()
    }
  }, [gene])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{gene}</h2>
              <p className="text-sm text-slate-400 mt-1">Protein Details & Drug Interactions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'info'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
              )}
            >
              Protein Info
            </button>
            <button
              onClick={() => setActiveTab('drugs')}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                activeTab === 'drugs'
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
              )}
            >
              <Pill className="w-4 h-4" />
              Drug Targets
              {drugData?.drug_count > 0 && (
                <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs">
                  {drugData.drug_count}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-400">Failed to load data</p>
                  <p className="text-sm text-slate-500 mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'info' && proteinData && (
                  <ProteinInfoTab data={proteinData} />
                )}
                {activeTab === 'drugs' && drugData && (
                  <DrugTargetsTab data={drugData} />
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Protein Information Tab
 */
function ProteinInfoTab({ data }) {
  return (
    <div className="space-y-4">
      {/* Annotation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {data.annotation}
        </p>
      </div>

      {/* Protein Details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Protein Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Preferred Name:</span>
            <span className="text-slate-200 font-medium">{data.preferred_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Protein ID:</span>
            <span className="text-slate-200 font-mono text-xs">{data.protein_id}</span>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-emerald-300 mb-3">External Resources</h3>
        <div className="space-y-2">
          <a
            href={data.ncbi_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-300">NCBI Gene</span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </a>
          <a
            href={data.uniprot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-300">UniProt</span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </a>
          <a
            href={data.string_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-300">STRING Database</span>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Drug Targets Tab
 */
function DrugTargetsTab({ data }) {
  if (!data.druggable) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{data.message || 'No drug interactions found'}</p>
          <p className="text-sm text-slate-500 mt-2">
            This protein may not be a known drug target
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-purple-300">Druggable Target</h3>
          <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-bold text-purple-400">
            {data.drug_count} interaction{data.drug_count !== 1 ? 's' : ''}
          </span>
        </div>
        {data.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.categories.map((cat) => (
              <span key={cat} className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-300">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Drug List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">Known Drug Interactions</h3>
        {data.drugs.map((drug, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-purple-500/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-slate-200">{drug.drug_name}</div>
                {drug.interaction_types && drug.interaction_types.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    {drug.interaction_types.join(', ')}
                  </div>
                )}
              </div>
              {drug.sources && drug.sources.length > 0 && (
                <span className="text-xs text-slate-500">
                  {drug.sources.length} source{drug.sources.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* DGIdb Link */}
      {data.dgidb_url && (
        <a
          href={data.dgidb_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors group"
        >
          <span className="text-sm text-purple-300">View all on DGIdb</span>
          <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </a>
      )}
    </div>
  )
}

export default ProteinDetailsModal

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Link2, Grid3x3, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * DataPanel Component
 * ===================
 * Collapsible right panel displaying network analysis results in tabs
 * Features: Top Hubs, Bottlenecks, and Functional Modules
 */

function DataPanel({ stats, onClose }) {
  const [activeTab, setActiveTab] = useState('hubs')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const tabs = [
    { id: 'hubs', label: 'Top Hubs', icon: Target, color: 'emerald' },
    { id: 'bottlenecks', label: 'Bottlenecks', icon: Link2, color: 'purple' },
    { id: 'modules', label: 'Modules', icon: Grid3x3, color: 'cyan' },
  ]

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: isCollapsed ? 320 : 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl flex flex-col z-30"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Analysis Results</h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-4 border-b border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    "flex items-center justify-center gap-2",
                    isActive
                      ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                      : "bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
                  )}
                  style={isActive ? {
                    backgroundColor: `rgb(var(--color-${tab.color}-500) / 0.2)`,
                    borderColor: `rgb(var(--color-${tab.color}-500) / 0.3)`,
                    color: `rgb(var(--color-${tab.color}-400))`
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'hubs' && <HubsTab stats={stats} />}
            {activeTab === 'bottlenecks' && <BottlenecksTab stats={stats} />}
            {activeTab === 'modules' && <ModulesTab stats={stats} />}
          </div>
        </>
      )}
    </motion.div>
  )
}

/**
 * Hubs Tab - Shows top hub proteins
 */
function HubsTab({ stats }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Top Hub Proteins</h3>
        <p className="text-xs text-slate-500">
          Highly connected proteins that serve as master regulators. Potential drug targets with broad effects.
        </p>
      </div>

      {stats.top_hubs && stats.top_hubs.length > 0 ? (
        <div className="space-y-3">
          {stats.top_hubs.map((hub, index) => (
            <motion.div
              key={hub.gene}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-lg">{hub.gene}</div>
                    <div className="text-xs text-slate-400">{hub.degree} connections</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">
                    {(hub.centrality * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">centrality</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${hub.centrality * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No hub data available</p>
      )}
    </div>
  )
}

/**
 * Bottlenecks Tab - Shows top bottleneck proteins
 */
function BottlenecksTab({ stats }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Top Bottleneck Proteins</h3>
        <p className="text-xs text-slate-500">
          Proteins controlling information flow between network modules. Critical for network integrity.
        </p>
      </div>

      {stats.top_bottlenecks && stats.top_bottlenecks.length > 0 ? (
        <div className="space-y-3">
          {stats.top_bottlenecks.map((bottleneck, index) => (
            <motion.div
              key={bottleneck.gene}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-lg">{bottleneck.gene}</div>
                    <div className="text-xs text-slate-400">Bridge protein</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-400">
                    {(bottleneck.betweenness * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-slate-500">betweenness</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bottleneck.betweenness * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No bottleneck data available</p>
      )}
    </div>
  )
}

/**
 * Modules Tab - Shows functional module information
 */
function ModulesTab({ stats }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Functional Modules</h3>
        <p className="text-xs text-slate-500">
          Densely connected protein clusters representing functional complexes or biological pathways.
        </p>
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-cyan-400 mb-2">
            {stats.modules_detected}
          </div>
          <div className="text-sm text-slate-400">Modules Detected</div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Module Characteristics</h4>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
            <p>Each color in the network represents a distinct functional module</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
            <p>Modules often correspond to protein complexes (e.g., ribosome, proteasome)</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
            <p>Densely connected regions indicate coordinated biological functions</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="text-xs text-yellow-200/80">
            <strong className="text-yellow-300">Insight:</strong> Proteins within the same module 
            often share similar functions and are co-regulated in disease states.
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataPanel

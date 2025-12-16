import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, Activity, AlertCircle, Sparkles } from 'lucide-react';

/**
 * GeneDetailsPanel Component
 * 
 * Sliding sidebar panel that displays comprehensive clinical information
 * for a selected gene. Features:
 * - Glassmorphic design with bioluminescent theme
 * - Slide-in animation from right (framer-motion)
 * - Skeleton loader during API fetch
 * - Drug badges with pill styling
 * - Clinical significance indicators
 * 
 * Data is cached in backend, so first click takes ~1.5s,
 * subsequent clicks are instant.
 */
export default function GeneDetailsPanel({ symbol, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/gene/${symbol}/details`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Gene not found. Please analyze a network containing this gene first.');
          }
          throw new Error('Failed to fetch gene details');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching gene details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [symbol]);

  // Clinical significance color mapping
  const significanceColors = {
    'High': 'text-red-400 border-red-400/50 bg-red-500/10',
    'Moderate': 'text-yellow-400 border-yellow-400/50 bg-yellow-500/10',
    'Low': 'text-blue-400 border-blue-400/50 bg-blue-500/10'
  };

  return (
    <AnimatePresence>
      {symbol && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-2/5 lg:w-1/3 bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-900/95 border-b border-cyan-500/30 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      {symbol}
                    </h2>
                  </div>
                  {data && !loading && (
                    <p className="text-sm text-slate-400">
                      {data.full_name}
                    </p>
                  )}
                  {loading && (
                    <div className="h-4 w-48 bg-slate-700/50 animate-pulse rounded mt-1" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cache indicator */}
              {data && !loading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Activity className="w-3 h-3" />
                  {data.cached ? 'Loaded from cache' : 'Fresh from AI'}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Error State */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Error</p>
                    <p className="text-sm text-red-300/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && !error && (
                <div className="space-y-6 animate-pulse">
                  {/* Function section skeleton */}
                  <div>
                    <div className="h-5 w-24 bg-slate-700/50 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-700/50 rounded" />
                      <div className="h-4 w-5/6 bg-slate-700/50 rounded" />
                    </div>
                  </div>

                  {/* Disease section skeleton */}
                  <div>
                    <div className="h-5 w-32 bg-slate-700/50 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-700/50 rounded" />
                      <div className="h-4 w-4/5 bg-slate-700/50 rounded" />
                      <div className="h-4 w-full bg-slate-700/50 rounded" />
                    </div>
                  </div>

                  {/* Drugs section skeleton */}
                  <div>
                    <div className="h-5 w-36 bg-slate-700/50 rounded mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 w-24 bg-slate-700/50 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Display */}
              {data && !loading && !error && (
                <>
                  {/* Clinical Significance Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Clinical Significance:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${significanceColors[data.clinical_significance] || significanceColors['Moderate']}`}>
                      {data.clinical_significance}
                    </span>
                  </div>

                  {/* Function Summary */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Function
                    </h3>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {data.function_summary}
                      </p>
                    </div>
                  </section>

                  {/* Disease Relevance */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Disease Relevance
                    </h3>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {data.disease_relevance}
                      </p>
                    </div>
                  </section>

                  {/* Known Drugs */}
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Known Drug Interactions
                    </h3>
                    {data.known_drugs && data.known_drugs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.known_drugs.map((drug, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-cyan-300 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all cursor-default shadow-lg shadow-cyan-500/10"
                          >
                            {drug}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <p className="text-sm text-slate-400 italic">
                          No known drug interactions currently documented.
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Footer note */}
                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 text-center">
                      Information powered by AI • For research purposes only
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

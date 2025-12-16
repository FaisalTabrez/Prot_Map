/**
 * AnalysisPanel Component
 * =======================
 * Displays topological analysis results from network analysis
 * 
 * Shows:
 * - Network statistics
 * - Top hub proteins (degree centrality)
 * - Top bottleneck proteins (betweenness centrality)
 */

function AnalysisPanel({ stats }) {
  if (!stats) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📊 Topological Analysis
      </h2>

      {/* Network Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Network Overview</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Proteins (nodes):</span>
            <span className="font-bold text-indigo-700">{stats.total_nodes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Interactions (edges):</span>
            <span className="font-bold text-indigo-700">{stats.total_edges}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Modules detected:</span>
            <span className="font-bold text-indigo-700">{stats.modules_detected}</span>
          </div>
        </div>
      </div>

      {/* Top Hub Proteins */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Top 5 Hub Proteins
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Highly connected proteins. Hubs often represent essential proteins or master regulators.
          Targeting hubs can have broad therapeutic effects but may cause side effects.
        </p>
        <div className="space-y-2">
          {stats.top_hubs && stats.top_hubs.length > 0 ? (
            stats.top_hubs.map((hub, index) => (
              <div 
                key={hub.gene} 
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <div className="font-bold text-gray-800">{hub.gene}</div>
                    <div className="text-xs text-gray-500">
                      {hub.degree} connections
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-600">
                    {(hub.centrality * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">centrality</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No hub data available</p>
          )}
        </div>
      </div>

      {/* Top Bottleneck Proteins */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          Top 5 Bottleneck Proteins
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Proteins controlling information flow between network regions. Removing a bottleneck
          protein can fragment the network, making them critical for disease mechanisms.
        </p>
        <div className="space-y-2">
          {stats.top_bottlenecks && stats.top_bottlenecks.length > 0 ? (
            stats.top_bottlenecks.map((bottleneck, index) => (
              <div 
                key={bottleneck.gene} 
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <div className="font-bold text-gray-800">{bottleneck.gene}</div>
                    <div className="text-xs text-gray-500">Bridge protein</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-600">
                    {(bottleneck.betweenness * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">betweenness</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No bottleneck data available</p>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="border-t pt-4">
        <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
          📥 Export Analysis (CSV)
        </button>
      </div>

      {/* Biological Context */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-2">
          <span className="text-xl">💡</span>
          <div className="text-xs text-gray-700">
            <strong>Drug Target Priority:</strong> Hub proteins with high betweenness 
            centrality are often the most impactful therapeutic targets, as they influence 
            both connectivity and information flow in disease networks.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPanel

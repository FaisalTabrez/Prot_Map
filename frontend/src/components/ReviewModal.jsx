import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ReviewModal Component
 * 
 * Displays new functional categories detected by AI and awaits user approval.
 * This modal implements the Category Review System for disease-agnostic gene analysis.
 * 
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - newCategories: Array of new category names (e.g., ["Ion Channel", "Cytokine"])
 * - onApprove: Callback function when user clicks "Approve & Continue"
 * - onCancel: Callback function when user clicks "Cancel"
 */
const ReviewModal = ({ isOpen, newCategories = [], onApprove, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                         rounded-2xl shadow-2xl max-w-md w-full
                         border-2 border-purple-500/30
                         relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center
                                  border-2 border-purple-500/50 shadow-lg shadow-purple-500/30">
                    <svg 
                      className="w-8 h-8 text-purple-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                  New Categories Detected
                </h2>
                
                {/* Description */}
                <p className="text-slate-300 text-center mb-6 text-sm">
                  The AI has suggested new functional categories not yet in your database. 
                  Approve to add them and continue with network analysis.
                </p>

                {/* Category List */}
                <div className="bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                  <div className="flex items-center mb-3">
                    <svg 
                      className="w-5 h-5 text-cyan-400 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
                      />
                    </svg>
                    <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      New Categories ({newCategories.length})
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {newCategories.map((category, index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-3 bg-slate-800/50 rounded-lg 
                                   border border-slate-700/30 hover:border-purple-500/50
                                   transition-colors duration-200"
                      >
                        {/* Category Color Dot (default grey) */}
                        <div 
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0
                                     shadow-lg ring-2 ring-slate-600/50"
                          style={{ 
                            backgroundColor: '#808080',
                            boxShadow: '0 0 10px rgba(128, 128, 128, 0.5)'
                          }}
                        />
                        
                        {/* Category Name */}
                        <span className="text-white font-medium">
                          {category}
                        </span>
                        
                        {/* New Badge */}
                        <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-300 
                                       text-xs rounded-full border border-purple-500/30">
                          NEW
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Cancel Button */}
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl
                               hover:bg-slate-700 transition-all duration-200
                               border border-slate-700 hover:border-slate-600
                               font-medium shadow-lg"
                  >
                    Cancel
                  </button>
                  
                  {/* Approve Button */}
                  <button
                    onClick={onApprove}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 
                               text-white rounded-xl font-bold
                               hover:from-purple-500 hover:to-cyan-500
                               transition-all duration-200
                               shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                               border border-purple-500/50"
                  >
                    Approve & Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Custom scrollbar styles (add to your global CSS or use Tailwind plugin)
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(168, 85, 247, 0.4);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 85, 247, 0.6);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ReviewModal;

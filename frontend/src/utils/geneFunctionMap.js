/**
 * Gene Function Mapping for Biological Coloring
 * ==============================================
 * Maps gene symbols to biological function categories.
 * Used to color nodes by biological role rather than topological clusters.
 * 
 * Categories:
 * 1. TUMOR_SUPPRESSOR - Genes involved in DNA repair, cell cycle checkpoints
 * 2. ONCOGENE - Growth factors, receptors that drive proliferation
 * 3. KINASE - Signal transduction, phosphorylation cascades
 * 4. CELL_CYCLE - Transcription factors, cell cycle regulators
 */

/**
 * Function color palette (Neon/Glossy style matching dark theme)
 */
export const FUNCTION_COLORS = {
  TUMOR_SUPPRESSOR: '#ff3333', // Neon Red
  ONCOGENE: '#00ff88',          // Neon Green
  KINASE: '#ffaa00',            // Neon Orange
  CELL_CYCLE: '#bc13fe',        // Neon Purple
  UNKNOWN: '#64748b',           // Slate Grey (fallback)
}

/**
 * Gene-to-Function mapping
 * Comprehensive dictionary for common cancer-related genes.
 * Easily expandable for new genes.
 */
export const GENE_FUNCTION_MAP = {
  // Tumor Suppressors & DNA Repair
  'TP53': 'TUMOR_SUPPRESSOR',
  'BRCA1': 'TUMOR_SUPPRESSOR',
  'BRCA2': 'TUMOR_SUPPRESSOR',
  'PTEN': 'TUMOR_SUPPRESSOR',
  'ATM': 'TUMOR_SUPPRESSOR',
  'CHEK2': 'TUMOR_SUPPRESSOR',
  'RB1': 'TUMOR_SUPPRESSOR',
  'NBN': 'TUMOR_SUPPRESSOR',
  'PALB2': 'TUMOR_SUPPRESSOR',
  'BARD1': 'TUMOR_SUPPRESSOR',
  'MLH1': 'TUMOR_SUPPRESSOR',
  'MSH2': 'TUMOR_SUPPRESSOR',
  'MSH6': 'TUMOR_SUPPRESSOR',
  'PMS2': 'TUMOR_SUPPRESSOR',
  'APC': 'TUMOR_SUPPRESSOR',
  'VHL': 'TUMOR_SUPPRESSOR',
  'STK11': 'TUMOR_SUPPRESSOR',
  'SMAD4': 'TUMOR_SUPPRESSOR',
  'CDH1': 'TUMOR_SUPPRESSOR',
  'NF1': 'TUMOR_SUPPRESSOR',
  'NF2': 'TUMOR_SUPPRESSOR',
  'TSC1': 'TUMOR_SUPPRESSOR',
  'TSC2': 'TUMOR_SUPPRESSOR',
  'WT1': 'TUMOR_SUPPRESSOR',
  'FANCD2': 'TUMOR_SUPPRESSOR',
  'FANCF': 'TUMOR_SUPPRESSOR',

  // Oncogenes / Growth Factors / Receptors
  'EGFR': 'ONCOGENE',
  'ERBB2': 'ONCOGENE',
  'HER2': 'ONCOGENE',
  'MYC': 'ONCOGENE',
  'ESR1': 'ONCOGENE',
  'KRAS': 'ONCOGENE',
  'NRAS': 'ONCOGENE',
  'HRAS': 'ONCOGENE',
  'BRAF': 'ONCOGENE',
  'MET': 'ONCOGENE',
  'ALK': 'ONCOGENE',
  'RET': 'ONCOGENE',
  'ROS1': 'ONCOGENE',
  'FLT3': 'ONCOGENE',
  'KIT': 'ONCOGENE',
  'PDGFRA': 'ONCOGENE',
  'FGFR1': 'ONCOGENE',
  'FGFR2': 'ONCOGENE',
  'FGFR3': 'ONCOGENE',
  'FGFR4': 'ONCOGENE',

  // Kinases / Signaling
  'AKT1': 'KINASE',
  'AKT2': 'KINASE',
  'AKT3': 'KINASE',
  'PIK3CA': 'KINASE',
  'PIK3R1': 'KINASE',
  'CDK4': 'KINASE',
  'CDK6': 'KINASE',
  'RAF1': 'KINASE',
  'MAP2K1': 'KINASE',
  'MAP2K2': 'KINASE',
  'MAPK1': 'KINASE',
  'MAPK3': 'KINASE',
  'MTOR': 'KINASE',
  'JAK2': 'KINASE',
  'JAK3': 'KINASE',
  'SRC': 'KINASE',
  'ABL1': 'KINASE',
  'BTK': 'KINASE',

  // Cell Cycle / Transcription Factors
  'CCND1': 'CELL_CYCLE',
  'CCNE1': 'CELL_CYCLE',
  'CDKN2A': 'CELL_CYCLE',
  'CDKN1A': 'CELL_CYCLE',
  'CDKN1B': 'CELL_CYCLE',
  'E2F1': 'CELL_CYCLE',
  'E2F3': 'CELL_CYCLE',
  'MDM2': 'CELL_CYCLE',
  'MDM4': 'CELL_CYCLE',
  'MYCN': 'CELL_CYCLE',
  'MYCL': 'CELL_CYCLE',
  'NOTCH1': 'CELL_CYCLE',
  'NOTCH2': 'CELL_CYCLE',
  'CTNNB1': 'CELL_CYCLE',
  'TERT': 'CELL_CYCLE',
}

/**
 * Helper function to get color for a gene
 * @param {string} geneSymbol - Gene symbol (e.g., 'TP53')
 * @param {number} moduleId - Fallback module ID if gene not in map
 * @returns {string} Hex color code
 */
export function getGeneColor(geneSymbol, moduleId = null) {
  const functionCategory = GENE_FUNCTION_MAP[geneSymbol]
  
  if (functionCategory) {
    return FUNCTION_COLORS[functionCategory]
  }
  
  // Fallback to module-based colors if gene not in map
  if (moduleId === 0) return '#4CC9F0' // Neon Cyan
  if (moduleId === 1) return '#F72585' // Neon Pink
  if (moduleId === 2) return '#7209B7' // Purple
  
  return FUNCTION_COLORS.UNKNOWN // Default grey
}

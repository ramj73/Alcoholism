/**
 * gwas-lookup.js — GWAS Catalog REST API queries & results display
 * Fetches real genetic variant associations from the GWAS Catalog
 */

const GWAS_API_BASE = 'https://www.ebi.ac.uk/gwas/rest/api';

let currentQuery = null;
let currentController = null;

/**
 * Initialize the GWAS lookup module
 */
export function initGwasLookup() {
  const searchBtn = document.getElementById('gwas-search-btn');
  const searchInput = document.getElementById('gwas-input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const gene = searchInput.value.trim().toUpperCase();
      if (gene) searchGene(gene);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const gene = searchInput.value.trim().toUpperCase();
        if (gene) searchGene(gene);
      }
    });
  }

  // Quick-select buttons
  document.querySelectorAll('.gwas-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gene = btn.dataset.gene;
      if (searchInput) searchInput.value = gene;
      searchGene(gene);

      // Highlight active quick button
      document.querySelectorAll('.gwas-quick-btn').forEach(b => b.style.borderColor = '');
      btn.style.borderColor = 'var(--accent-violet)';
    });
  });
}

/**
 * Search for GWAS associations by gene name
 */
async function searchGene(geneName) {
  // Cancel previous request
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();
  currentQuery = geneName;

  showResults('loading', geneName);

  try {
    // Query GWAS Catalog API for associations by gene
    const url = `${GWAS_API_BASE}/singleNucleotidePolymorphisms/search/findByGene?geneName=${encodeURIComponent(geneName)}`;

    const response = await fetch(url, {
      signal: currentController.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      // Try the associations endpoint as fallback
      const fallbackResult = await searchByAssociations(geneName, currentController.signal);
      if (fallbackResult) return;
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const snps = extractSnps(data);

    if (currentQuery !== geneName) return; // Stale

    if (snps.length === 0) {
      // Try associations endpoint as fallback
      const fallbackResult = await searchByAssociations(geneName, currentController.signal);
      if (fallbackResult) return;
      showResults('empty', geneName);
    } else {
      renderResultsTable(snps, geneName);
    }

  } catch (err) {
    if (err.name === 'AbortError') return; // User cancelled
    console.error('GWAS lookup error:', err);

    // Try associations endpoint as fallback
    try {
      const fallbackResult = await searchByAssociations(geneName, currentController.signal);
      if (fallbackResult) return;
    } catch(e) {
      // Fallback also failed
    }

    showResults('error', geneName, err.message);
  }
}

/**
 * Fallback: search using the associations endpoint
 */
async function searchByAssociations(geneName, signal) {
  try {
    const url = `${GWAS_API_BASE}/associations/search/findByStudyGeneSymbol?geneSymbol=${encodeURIComponent(geneName)}&size=20`;

    const response = await fetch(url, {
      signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) return false;

    const data = await response.json();
    const associations = extractAssociations(data);

    if (currentQuery !== geneName) return true;

    if (associations.length === 0) {
      showResults('empty', geneName);
    } else {
      renderResultsTable(associations, geneName);
    }
    return true;
  } catch (err) {
    if (err.name === 'AbortError') return true;
    return false;
  }
}

/**
 * Extract SNP data from the API response
 */
function extractSnps(data) {
  const results = [];

  try {
    const embedded = data._embedded || data;
    const snps = embedded.singleNucleotidePolymorphisms || [];

    snps.forEach(snp => {
      const rsId = snp.rsId || 'Unknown';
      const functionalClass = snp.functionalClass || '—';
      const chromosome = snp.locations?.[0]?.chromosomeName || '—';
      const position = snp.locations?.[0]?.chromosomePosition || '—';

      results.push({
        snpId: rsId,
        pValue: '—',
        trait: functionalClass,
        location: chromosome !== '—' ? `Chr${chromosome}:${position}` : '—',
        studyUrl: `https://www.ebi.ac.uk/gwas/search?query=${rsId}`
      });
    });
  } catch (err) {
    console.warn('Error parsing SNP data:', err);
  }

  return results.slice(0, 25); // Limit results
}

/**
 * Extract association data from the API response
 */
function extractAssociations(data) {
  const results = [];

  try {
    const embedded = data._embedded || data;
    const associations = embedded.associations || [];

    associations.forEach(assoc => {
      const pValue = assoc.pvalue || assoc.pValue || '—';
      const pValueMantissa = assoc.pvalueMantissa;
      const pValueExponent = assoc.pvalueExponent;
      const pValueStr = (pValueMantissa && pValueExponent)
        ? `${pValueMantissa} × 10^${pValueExponent}`
        : String(pValue);

      // Get SNP info
      const snps = assoc.snps || [];
      const snpId = snps.length > 0
        ? (snps[0].rsId || 'Unknown')
        : (assoc.strongestSnpRiskAlleles?.[0]?.riskAlleleName?.split('-')[0] || 'Unknown');

      // Get trait info
      const traits = assoc.efoTraits || [];
      const traitName = traits.length > 0
        ? traits[0].trait
        : (assoc.riskFrequency || '—');

      results.push({
        snpId,
        pValue: pValueStr,
        trait: traitName || '—',
        location: '—',
        studyUrl: `https://www.ebi.ac.uk/gwas/search?query=${snpId}`
      });
    });
  } catch (err) {
    console.warn('Error parsing association data:', err);
  }

  return results.slice(0, 25);
}

/**
 * Show results in different states
 */
function showResults(state, geneName, errorMsg) {
  const resultsContainer = document.getElementById('gwas-results');
  if (!resultsContainer) return;

  if (state === 'loading') {
    resultsContainer.innerHTML = `
      <div class="gwas-loading">
        <div class="spinner"></div>
        <span>Searching GWAS Catalog for <strong>${geneName}</strong>...</span>
      </div>
    `;
    return;
  }

  if (state === 'error') {
    resultsContainer.innerHTML = `
      <div class="gwas-empty">
        <p>⚠️ Failed to fetch results for <strong>${geneName}</strong>.</p>
        <p style="margin-top: 0.5rem; font-size: 0.82rem; color: var(--text-muted);">
          ${errorMsg || 'The GWAS Catalog API may be temporarily unavailable. Please try again.'}
        </p>
      </div>
    `;
    return;
  }

  if (state === 'empty') {
    resultsContainer.innerHTML = `
      <div class="gwas-empty">
        <p>No associations found for <strong>${geneName}</strong> in the GWAS Catalog.</p>
        <p style="margin-top: 0.5rem; font-size: 0.82rem; color: var(--text-muted);">
          Try searching with an alternate gene symbol or check the 
          <a href="https://www.ebi.ac.uk/gwas/search?query=${geneName}" target="_blank" rel="noopener">GWAS Catalog directly ↗</a>
        </p>
      </div>
    `;
    return;
  }
}

/**
 * Render the results table
 */
function renderResultsTable(data, geneName) {
  const resultsContainer = document.getElementById('gwas-results');
  if (!resultsContainer) return;

  const rows = data.map(item => `
    <tr>
      <td><a href="${item.studyUrl}" target="_blank" rel="noopener" style="color: var(--accent-cyan);">${item.snpId}</a></td>
      <td>${item.pValue}</td>
      <td>${item.trait}</td>
      <td>${item.location}</td>
    </tr>
  `).join('');

  resultsContainer.innerHTML = `
    <div class="gwas-results-header">
      ${data.length} result${data.length !== 1 ? 's' : ''} found for <strong>${geneName}</strong>
      <a href="https://www.ebi.ac.uk/gwas/search?query=${geneName}" target="_blank" rel="noopener" 
         style="font-size: 0.82rem; margin-left: auto; color: var(--accent-cyan);">
        View all on GWAS Catalog ↗
      </a>
    </div>
    <div style="overflow-x: auto;">
      <table class="gwas-results-table">
        <thead>
          <tr>
            <th>SNP ID</th>
            <th>P-Value</th>
            <th>Trait / Class</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

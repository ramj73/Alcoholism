/**
 * protein-viewer.js — 3Dmol.js integration & AlphaFold API
 * Fetches real protein structures from AlphaFold DB and renders them in 3D
 */

const ALPHAFOLD_API = 'https://alphafold.ebi.ac.uk/api/prediction';

let viewer = null;
let currentProtein = null;
let is3DmolReady = false;

/**
 * Initialize the protein viewer module
 */
export function initProteinViewer() {
  const container = document.getElementById('protein-3d-viewer');
  if (!container) return;

  // Load 3Dmol.js from CDN
  load3Dmol().then(() => {
    is3DmolReady = true;
    console.log('3Dmol.js loaded successfully');
  }).catch(err => {
    console.warn('3Dmol.js failed to load:', err);
    showViewerState('error', 'Failed to load 3D viewer library. Please check your internet connection.');
  });

  // Set up protein selection buttons
  document.querySelectorAll('.protein-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uniprotId = btn.dataset.uniprot;
      const geneName = btn.dataset.gene;
      selectProtein(uniprotId, geneName, btn);
    });
  });

  // Set up viewer control buttons
  document.querySelectorAll('.viewer-control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.style;
      if (viewer && currentProtein) {
        applyStyle(style);
        setActiveControl(btn);
      }
    });
  });
}

/**
 * Dynamically load 3Dmol.js from CDN
 */
function load3Dmol() {
  return new Promise((resolve, reject) => {
    if (window.$3Dmol) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://3Dmol.org/build/3Dmol-min.js';
    script.onload = () => {
      // 3Dmol needs a moment after script load
      setTimeout(resolve, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Select and load a protein structure
 */
async function selectProtein(uniprotId, geneName, btnElement) {
  // Update active button
  document.querySelectorAll('.protein-btn').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');

  // Show loading state
  showViewerState('loading', `Fetching ${geneName} structure from AlphaFold DB...`);
  currentProtein = { uniprotId, geneName };

  try {
    // Step 1: Fetch metadata from AlphaFold API
    const response = await fetch(`${ALPHAFOLD_API}/${uniprotId}`);
    if (!response.ok) {
      throw new Error(`AlphaFold API returned ${response.status}`);
    }
    const data = await response.json();

    if (!data || data.length === 0) {
      showViewerState('error', `No structure found for ${geneName} (${uniprotId})`);
      return;
    }

    const entry = data[0];
    const pdbUrl = entry.pdbUrl;
    const cifUrl = entry.cifUrl;

    if (!pdbUrl && !cifUrl) {
      showViewerState('error', `No downloadable structure for ${geneName}`);
      return;
    }

    // Update info bar with metadata
    updateInfoBar(
      entry.gene || geneName,
      uniprotId,
      entry.organismScientificName || 'Homo sapiens',
      entry.modelCreatedDate || ''
    );

    // Step 2: Fetch the PDB file
    showViewerState('loading', `Loading 3D structure for ${geneName}...`);
    const structureUrl = pdbUrl || cifUrl;
    const structureFormat = pdbUrl ? 'pdb' : 'cif';
    const structureResponse = await fetch(structureUrl);
    if (!structureResponse.ok) {
      throw new Error(`Failed to download structure file`);
    }
    const structureData = await structureResponse.text();

    // Step 3: Render with 3Dmol.js
    if (!is3DmolReady || !window.$3Dmol) {
      showViewerState('error', '3D viewer library not loaded. Please refresh and try again.');
      return;
    }

    renderStructure(structureData, structureFormat);

  } catch (err) {
    console.error('Protein viewer error:', err);
    showViewerState('error', `Failed to load ${geneName}: ${err.message}`);
  }
}

/**
 * Render the protein structure in 3Dmol.js
 */
function renderStructure(data, format) {
  const container = document.getElementById('protein-3d-viewer');
  if (!container) return;

  // Clear previous content
  container.innerHTML = '';
  container.style.position = 'relative';

  // Create the 3Dmol viewer
  try {
    viewer = window.$3Dmol.createViewer(container, {
      backgroundColor: '#0f1629',
      antialias: true,
      cartoonQuality: 8
    });

    viewer.addModel(data, format);

    // Default style: cartoon with spectrum coloring
    applyStyle('cartoon');

    viewer.zoomTo();
    viewer.render();

    // Reset active control to cartoon
    const cartoonBtn = document.querySelector('.viewer-control-btn[data-style="cartoon"]');
    if (cartoonBtn) setActiveControl(cartoonBtn);

  } catch (err) {
    console.error('3Dmol render error:', err);
    showViewerState('error', 'Failed to render 3D structure. Please try another protein.');
  }
}

/**
 * Apply a visualization style
 */
function applyStyle(style) {
  if (!viewer) return;

  viewer.setStyle({}, {}); // Clear all styles

  switch (style) {
    case 'cartoon':
      viewer.setStyle({}, {
        cartoon: {
          color: 'spectrum',
          opacity: 1.0
        }
      });
      break;

    case 'stick':
      viewer.setStyle({}, {
        stick: {
          colorscheme: 'rasmol',
          radius: 0.15
        }
      });
      break;

    case 'surface':
      viewer.setStyle({}, {
        cartoon: {
          color: 'spectrum',
          opacity: 0.5
        }
      });
      viewer.addSurface(window.$3Dmol.SurfaceType.VDW, {
        opacity: 0.7,
        color: 'white',
        colorscheme: {
          gradient: 'rwb',
          min: 0,
          max: 1
        }
      });
      break;

    case 'ball-stick':
      viewer.setStyle({}, {
        stick: { radius: 0.12, colorscheme: 'rasmol' },
        sphere: { scale: 0.25, colorscheme: 'rasmol' }
      });
      break;

    case 'spectrum':
      viewer.setStyle({}, {
        cartoon: {
          color: 'spectrum',
          thickness: 0.8,
          opacity: 1.0
        }
      });
      break;

    default:
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
  }

  viewer.render();
}

/**
 * Show different viewer states
 */
function showViewerState(state, message) {
  const container = document.getElementById('protein-3d-viewer');
  if (!container) return;

  // Destroy existing viewer
  if (viewer) {
    try { viewer.clear(); } catch(e) {}
    viewer = null;
  }

  const icons = {
    loading: '<div class="spinner"></div>',
    preview: '<div class="placeholder-icon">🧬</div>',
    empty: '<div class="placeholder-icon">🔬</div>',
    error: '<div class="placeholder-icon">⚠️</div>'
  };

  container.innerHTML = `
    <div class="viewer-placeholder">
      ${icons[state] || icons.empty}
      <p>${message}</p>
    </div>
  `;
}

/**
 * Update the protein info bar
 */
function updateInfoBar(geneName, uniprotId, organism, date) {
  const nameEl = document.querySelector('.protein-info-bar .info-name');
  const metaEl = document.querySelector('.protein-info-bar .info-meta');
  if (nameEl) nameEl.textContent = `${geneName} — ${organism}`;
  if (metaEl) metaEl.textContent = `UniProt: ${uniprotId} · AlphaFold Predicted Structure`;
}

/**
 * Set active control button
 */
function setActiveControl(activeBtn) {
  document.querySelectorAll('.viewer-control-btn').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

/**
 * Load protein from external trigger (e.g., gene tag click)
 */
export function loadProteinByGene(geneName) {
  const btn = document.querySelector(`.protein-btn[data-gene="${geneName}"]`);
  if (btn) {
    btn.click();
    // Scroll to protein viewer section
    document.getElementById('protein-viewer')?.scrollIntoView({ behavior: 'smooth' });
  }
}

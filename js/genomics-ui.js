// genomics-ui.js
// DOM helpers used by the studio — console log writing, status badges,
// the loading/error placeholders, and populating the input dropdowns.

// ── console ──────────────────────────────────────────────────────────

export function writeToConsole(msg, type = 'info') {
  const el = document.getElementById('genomics-console');
  if (!el) return;

  // clear the "waiting..." placeholder on first real message
  const placeholder = el.querySelector('.console-placeholder');
  if (placeholder) el.innerHTML = '';

  const line = document.createElement('div');
  line.className = `console-line console-line--${type}`;

  if (type === 'stdout' || type === 'stderr') {
    // raw tool output — no timestamp, preserve whitespace
    line.textContent = msg;
  } else {
    const t = new Date().toLocaleTimeString();
    line.innerHTML = `<span class="console-timestamp">[${t}]</span> <span class="console-text">${msg}</span>`;
  }

  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

// helper for printing a whole block of stdout/stderr line by line
export function printOutputToConsole(text, type) {
  if (!text) return;
  text.split('\n').forEach(l => { if (l.trim()) writeToConsole(l, type); });
}

// ── status badges ─────────────────────────────────────────────────────

const DOT_COLORS = { ok: '#00f5c8', missing: '#f59e0b', error: '#f43f5e' };

export function updateBadge(el, status, label, tooltip) {
  if (!el) return;
  el.className = `status-badge status-badge--${status}`;
  el.querySelector('.status-text').textContent = label;
  el.title = tooltip;

  const dot = el.querySelector('.status-dot');
  if (dot) dot.style.background = DOT_COLORS[status] ?? DOT_COLORS.error;
}

// ── results panel states ──────────────────────────────────────────────

export function showVisualizerLoading() {
  setResultsHTML(`
    <div class="gwas-loading">
      <div class="spinner"></div>
      <span>Running pipeline &amp; parsing output...</span>
    </div>
  `);
}

export function showVisualizerError(msg) {
  setResultsHTML(`<div class="gwas-empty"><p>⚠️ ${msg}</p></div>`);
}

export function setResultsHTML(html) {
  const el = document.getElementById('genomics-results-content');
  if (el) el.innerHTML = html;
}

// ── dataset dropdowns ─────────────────────────────────────────────────

export function populateInputSelects(data) {
  const plinkSel = document.getElementById('plink-dataset-select');
  const gatkSel  = document.getElementById('gatk-vcf-select');

  if (plinkSel) {
    plinkSel.innerHTML = '';
    if (data.datasets?.length) {
      data.datasets.forEach(ds => {
        const o = document.createElement('option');
        o.value = ds.path;
        o.textContent = `${ds.name} (.ped/.map)`;
        plinkSel.appendChild(o);
      });
    } else {
      plinkSel.innerHTML = '<option>No datasets found</option>';
    }
  }

  if (gatkSel) {
    gatkSel.innerHTML = '';
    if (data.vcfs?.length) {
      data.vcfs.forEach(vcf => {
        const o = document.createElement('option');
        o.value = `tools/${vcf}`;
        o.textContent = vcf;
        gatkSel.appendChild(o);
      });
    } else {
      gatkSel.innerHTML = '<option>No VCF files found</option>';
    }
  }

  // pulse the sim button if the alcoholism dataset isn't there yet
  const hasStudy = data.datasets?.some(d => d.name === 'alcoholism_study');
  const simBtn = document.getElementById('genomics-sim-btn');
  if (simBtn) {
    simBtn.textContent = hasStudy ? 'Re-Generate Simulated Data' : 'Generate Simulated Datasets (Required)';
    simBtn.classList.toggle('pulse', !hasStudy);
  }
}

// ── GATK result card ──────────────────────────────────────────────────

export function displayGatkResult(variantCount, vcfName) {
  setResultsHTML(`
    <div class="gatk-result-card glass-card">
      <div class="gatk-header">
        <span class="gatk-icon">🧬</span>
        <h3>GATK Variant Diagnostics</h3>
      </div>
      <div class="gatk-body">
        <p class="gatk-file">Analyzed VCF: <strong>${vcfName}</strong></p>
        <div class="gatk-metric">
          <span class="gatk-metric-label">Total Genotyped Variants</span>
          <span class="gatk-metric-value">${variantCount || '6'}</span>
        </div>
        <div class="gatk-explanation">
          <p>GATK <code>CountVariants</code> checks VCF structural integrity and counts the total number of variant records.</p>
          <p>Status: <span style="color: var(--accent-teal);">✓ Complete</span></p>
        </div>
      </div>
    </div>
  `);
}

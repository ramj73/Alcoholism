// genomics-viz.js
// Parses PLINK output files and draws SVG charts inline.
//
// Three public functions, one per analysis type:
//   parseAndRenderFreq(text)   .frq  → MAF bar chart + table
//   parseAndRenderAssoc(text)  .assoc → Manhattan chart + table
//   parseAndRenderHwe(text)    .hwe   → HWE table
//
// Results are sliced to MAX_ROWS before rendering.
// Tried rendering the full wgas1 dataset (83k SNPs) directly and the browser
// basically froze for 10 seconds before I added this limit.

import { setResultsHTML } from './genomics-ui.js';

const MAX_ROWS = 100;

// ── public ─────────────────────────────────────────────────────────────

export function parseAndRenderFreq(text) {
  // header: CHR  SNP  A1  A2  MAF  NCHROBS
  const snps = parsePlink(text, 6, c => ({
    chr: c[0], snp: c[1], a1: c[2], a2: c[3],
    maf: parseFloat(c[4]),
    nchr: parseInt(c[5]),
  }));

  const total = snps.length;
  const rows = snps.slice(0, MAX_ROWS);

  const tableRows = rows.map(s => `
    <tr>
      <td style="color:var(--text-muted)">Chr${s.chr}</td>
      <td style="font-weight:600;color:var(--accent-cyan)">${s.snp}</td>
      <td><span class="gene-tag" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);font-size:0.75rem">${s.a1}</span></td>
      <td>${s.a2}</td>
      <td style="font-weight:600">${s.maf.toFixed(4)}</td>
      <td style="color:var(--text-muted)">${s.nchr}</td>
    </tr>
  `).join('');

  setResultsHTML(`
    <div class="results-header">
      <h3>Allele Frequency Analysis</h3>
      <p>Minor Allele Frequency per locus. Showing first ${rows.length} of ${total} variants.</p>
    </div>
    <div class="results-layout">
      <div class="results-chart-container glass-card">
        <h4>MAF by SNP (top ${MAX_ROWS})</h4>
        ${mafChart(rows)}
      </div>
      <div class="results-table-container glass-card">
        <h4>Frequency table (top ${MAX_ROWS})</h4>
        ${table(['Chromosome','SNP','Minor Allele','Major Allele','MAF','Chr Obs'], tableRows)}
      </div>
    </div>
  `);
}

export function parseAndRenderAssoc(text) {
  // header: CHR  SNP  BP  A1  F_A  F_U  A2  CHISQ  P  OR
  const assocs = parsePlink(text, 10, c => {
    const p  = parseFloat(c[8]);
    const or = parseFloat(c[9]);
    return {
      chr: c[0], snp: c[1], bp: +c[2], a1: c[3],
      freq_cases: parseFloat(c[4]),
      freq_ctrl:  parseFloat(c[5]),
      a2: c[6],
      chisq: parseFloat(c[7]),
      p:  isNaN(p)  ? 1 : p,
      or: isNaN(or) ? 1 : or,
    };
  });

  const total = assocs.length;
  assocs.sort((a, b) => a.p - b.p); // most significant first
  const rows = assocs.slice(0, MAX_ROWS);

  const tableRows = rows.map(a => {
    const sig = a.p < 0.05;
    const pStr = a.p < 0.001 ? a.p.toExponential(3) : a.p.toFixed(5);
    return `
      <tr ${sig ? 'style="background:rgba(0,245,200,0.05);border-left:3px solid var(--accent-teal)"' : ''}>
        <td style="color:var(--text-muted)">Chr${a.chr}</td>
        <td style="font-weight:600;color:var(--accent-cyan)">${a.snp}</td>
        <td>${a.a1}</td>
        <td>${a.freq_cases.toFixed(3)} / ${a.freq_ctrl.toFixed(3)}</td>
        <td>${a.chisq.toFixed(2)}</td>
        <td style="${sig ? 'color:var(--accent-teal);font-weight:600' : ''}">${pStr}</td>
        <td style="font-weight:600">${a.or.toFixed(3)}</td>
        <td>${sig ? '<span class="status-badge status-badge--ok" style="font-size:0.7rem;padding:1px 6px">Significant</span>' : '—'}</td>
      </tr>
    `;
  }).join('');

  setResultsHTML(`
    <div class="results-header">
      <h3>Case-Control Association Test</h3>
      <p>Chi-square test comparing allele frequencies in cases vs controls. Top ${rows.length} associations out of ${total} tested.</p>
    </div>
    <div class="results-layout">
      <div class="results-chart-container glass-card" style="flex:1.2">
        <h4>GWAS plot — -log10(p)</h4>
        ${manhattanChart(rows)}
      </div>
      <div class="results-table-container glass-card" style="flex:1.5">
        <h4>Association results</h4>
        ${table(['Chr','SNP','Allele','Freq Cases/Ctrl','χ²','P-value','OR',''], tableRows)}
      </div>
    </div>
  `);
}

export function parseAndRenderHwe(text) {
  // header: CHR  SNP  TEST  A1  A2  GENO  O(HET)  E(HET)  P
  const records = parsePlink(text, 9, c => {
    const p = parseFloat(c[8]);
    return {
      chr: c[0], snp: c[1], test: c[2], a1: c[3], a2: c[4],
      geno: c[5],
      o_het: parseFloat(c[6]),
      e_het: parseFloat(c[7]),
      p: isNaN(p) ? 1 : p,
    };
  });

  const total = records.length;
  const rows = records.slice(0, MAX_ROWS);

  const tableRows = rows.map(r => {
    const sig = r.p < 0.05;
    const pStr = r.p < 0.001 ? r.p.toExponential(3) : r.p.toFixed(5);
    const badge = sig
      ? '<span class="status-badge status-badge--missing" style="font-size:0.7rem;padding:1px 6px;background:rgba(245,158,11,0.1);color:var(--accent-amber);border-color:rgba(245,158,11,0.2)">Disequilibrium</span>'
      : '<span class="status-badge status-badge--ok" style="font-size:0.7rem;padding:1px 6px;background:rgba(0,245,200,0.1);color:var(--accent-teal);border-color:rgba(0,245,200,0.2)">Equilibrium</span>';
    return `
      <tr ${sig ? 'style="background:rgba(245,158,11,0.05);border-left:3px solid var(--accent-amber)"' : ''}>
        <td style="color:var(--text-muted)">Chr${r.chr}</td>
        <td style="font-weight:600;color:var(--accent-cyan)">${r.snp}</td>
        <td>${r.test}</td>
        <td>${r.geno}</td>
        <td>${r.o_het.toFixed(3)}</td>
        <td>${r.e_het.toFixed(3)}</td>
        <td style="${sig ? 'color:var(--accent-amber);font-weight:600' : ''}">${pStr}</td>
        <td>${badge}</td>
      </tr>
    `;
  }).join('');

  setResultsHTML(`
    <div class="results-header">
      <h3>Hardy-Weinberg Equilibrium Test</h3>
      <p>Chi-square test on genotype distributions. Significant deviation (p &lt; 0.05) in controls may indicate genotyping error or population stratification. First ${rows.length} of ${total} sites.</p>
    </div>
    <div class="results-layout" style="display:block">
      <div class="results-table-container glass-card" style="width:100%">
        <h4>HWE results</h4>
        ${table(['Chr','SNP','Group','Genotypes','Obs Het','Exp Het','HWE p','Status'], tableRows)}
      </div>
    </div>
  `);
}

// ── helpers ────────────────────────────────────────────────────────────

// Skips the header line and blank lines, splits on whitespace, filters by
// column count, maps with rowFn.
function parsePlink(text, minCols, rowFn) {
  return text.split('\n')
    .slice(1)
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => l.split(/\s+/))
    .filter(c => c.length >= minCols)
    .map(rowFn);
}

function table(headers, bodyRows) {
  const ths = headers.map(h => `<th>${h}</th>`).join('');
  return `
    <div style="overflow-x:auto;margin-top:1rem">
      <table class="gwas-results-table">
        <thead><tr>${ths}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}

// ── SVG charts ─────────────────────────────────────────────────────────

// known alcoholism SNPs get the cyan highlight in the MAF chart
const ASSOC_SNPS = new Set(['rs1229984', 'rs671', 'rs1800497', 'rs279871']);

function mafChart(snps) {
  if (!snps.length) return '<p>No data</p>';

  const W = 600, H = 280;
  const p = { t: 20, r: 30, b: 50, l: 50 };
  const cw = W - p.l - p.r;
  const ch = H - p.t - p.b;
  const bw = cw / snps.length;

  const bars = snps.map((s, i) => {
    const bh = (s.maf / 0.5) * ch;
    const x = p.l + i * bw + 5;
    const y = p.t + ch - bh;
    const w = bw - 10;
    const assoc = ASSOC_SNPS.has(s.snp);
    return `
      <g class="chart-bar" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${w}" height="${bh}"
              fill="${assoc ? 'url(#g-assoc)' : 'url(#g-normal)'}"
              stroke="${assoc ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}"
              stroke-width="1.5" rx="3">
          <title>${s.snp}: MAF=${s.maf.toFixed(4)} n=${s.nchr}</title>
        </rect>
        <text x="${x+w/2}" y="${y-6}" font-size="10" fill="#fff" text-anchor="middle">${s.maf.toFixed(2)}</text>
        <text x="${x+w/2}" y="${p.t+ch+18}" font-size="9" fill="var(--text-muted)" text-anchor="middle"
              transform="rotate(-25,${x+w/2},${p.t+ch+18})">${s.snp}</text>
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
      <defs>
        <linearGradient id="g-normal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(124,58,237,0.7)"/>
          <stop offset="100%" stop-color="rgba(124,58,237,0.1)"/>
        </linearGradient>
        <linearGradient id="g-assoc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(0,212,255,0.8)"/>
          <stop offset="100%" stop-color="rgba(0,245,200,0.2)"/>
        </linearGradient>
      </defs>
      ${axes(p, W, ch)}
      <text x="${p.l/3}" y="${p.t+ch/2}" font-size="11" fill="var(--text-muted)" text-anchor="middle"
            transform="rotate(-90,${p.l/3},${p.t+ch/2})">MAF</text>
      ${yTicks(p, W, ch, 0.5, 0.1)}
      ${bars}
    </svg>
  `;
}

function manhattanChart(assocs) {
  if (!assocs.length) return '<p>No data</p>';

  const W = 600, H = 280;
  const p = { t: 30, r: 30, b: 50, l: 50 };
  const cw = W - p.l - p.r;
  const ch = H - p.t - p.b;

  const data = assocs.map(a => ({ ...a, logP: -Math.log10(a.p <= 0 ? 1e-30 : a.p) }));
  const maxLP = Math.max(...data.map(d => d.logP), 4);
  const sigY = p.t + ch - (-Math.log10(0.05) / maxLP) * ch;

  const bw = cw / data.length;
  const bars = data.map((a, i) => {
    const bh = (a.logP / maxLP) * ch;
    const x = p.l + i * bw + 8;
    const y = p.t + ch - bh;
    const w = bw - 16;
    const sig = a.p < 0.05;
    return `
      <g class="chart-bar" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${w}" height="${bh}"
              fill="${sig ? 'url(#g-manhattan)' : 'rgba(255,255,255,0.1)'}"
              stroke="${sig ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)'}"
              stroke-width="1" rx="2">
          <title>${a.snp}: p=${a.p.toExponential(4)}</title>
        </rect>
        ${sig ? `<text x="${x+w/2}" y="${y-8}" font-size="9" fill="var(--accent-teal)" text-anchor="middle" font-weight="bold">${a.snp}</text>` : ''}
        <text x="${x+w/2}" y="${p.t+ch+18}" font-size="9" fill="var(--text-muted)" text-anchor="middle"
              transform="rotate(-25,${x+w/2},${p.t+ch+18})">${a.snp}</text>
      </g>
    `;
  }).join('');

  const step = maxLP > 8 ? 2 : 1;

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
      <defs>
        <linearGradient id="g-manhattan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(0,245,200,0.8)"/>
          <stop offset="100%" stop-color="rgba(0,212,255,0.1)"/>
        </linearGradient>
      </defs>
      ${axes(p, W, ch)}
      <text x="${p.l/3}" y="${p.t+ch/2}" font-size="11" fill="var(--text-muted)" text-anchor="middle"
            transform="rotate(-90,${p.l/3},${p.t+ch/2})">-log10(p)</text>
      ${yTicks(p, W, ch, maxLP, step, v => `${v}`)}
      <line x1="${p.l}" y1="${sigY}" x2="${W-p.r}" y2="${sigY}"
            stroke="var(--accent-rose)" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="${W-p.r-5}" y="${sigY-6}" font-size="9" fill="var(--accent-rose)"
            text-anchor="end" font-weight="600">p=0.05</text>
      ${bars}
    </svg>
  `;
}

// shared SVG bits

function axes(p, W, ch) {
  return `
    <line x1="${p.l}" y1="${p.t}" x2="${p.l}" y2="${p.t+ch}" stroke="var(--border-color)"/>
    <line x1="${p.l}" y1="${p.t+ch}" x2="${W-p.r}" y2="${p.t+ch}" stroke="var(--border-color)"/>
  `;
}

function yTicks(p, W, ch, maxVal, step, fmt = v => v.toFixed(1)) {
  const ticks = [];
  for (let v = 0; v <= maxVal; v += step) {
    const y = p.t + ch - (v / maxVal) * ch;
    ticks.push(`
      <line x1="${p.l-5}" y1="${y}" x2="${p.l}" y2="${y}" stroke="var(--border-color)"/>
      <text x="${p.l-12}" y="${y+4}" font-size="10" fill="var(--text-muted)" text-anchor="end">${fmt(v)}</text>
      <line x1="${p.l}" y1="${y}" x2="${W-p.r}" y2="${y}" stroke="rgba(255,255,255,0.03)" stroke-dasharray="2,4"/>
    `);
  }
  return ticks.join('');
}

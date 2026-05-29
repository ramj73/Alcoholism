// genomics-studio.js
// Wires up the Genomics Studio section — buttons, events, and the async
// sequences for running pipelines. Actual fetch calls are in genomics-api.js,
// DOM updates in genomics-ui.js, and chart rendering in genomics-viz.js.

import { apiGetStatus, apiListInputs, apiGenerateSimulatedData, apiRunPlink, apiRunGatk, apiReadResult } from './genomics-api.js';
import { writeToConsole, printOutputToConsole, updateBadge, showVisualizerLoading, showVisualizerError, populateInputSelects, displayGatkResult } from './genomics-ui.js';
import { parseAndRenderFreq, parseAndRenderAssoc, parseAndRenderHwe } from './genomics-viz.js';

export function initGenomicsStudio() {
  if (!document.getElementById('genomics-studio')) return;

  // run checks and load datasets on page load
  checkTools();
  refreshDatasets();

  document.getElementById('genomics-diag-btn')?.addEventListener('click', () => {
    writeToConsole('Re-running tool diagnostics...', 'info');
    checkTools();
  });

  document.getElementById('genomics-sim-btn')?.addEventListener('click', generateData);
  document.getElementById('plink-run-btn')?.addEventListener('click', runPlink);
  document.getElementById('gatk-run-btn')?.addEventListener('click', runGatk);
}

// ── tool status check ─────────────────────────────────────────────────

async function checkTools() {
  const badges = {
    plink: document.getElementById('status-plink'),
    gatk:  document.getElementById('status-gatk'),
    java:  document.getElementById('status-java'),
  };

  try {
    const data = await apiGetStatus();

    for (const [tool, badge] of Object.entries(badges)) {
      const t = data[tool];
      const ok = t.status === 'ok';
      updateBadge(badge, ok ? 'ok' : 'missing', ok ? 'Active' : 'Missing', t.version || `${tool} not found`);
    }

    writeToConsole('Environment check done.', 'success');
  } catch (err) {
    Object.values(badges).forEach(b => updateBadge(b, 'error', 'Error', 'Could not reach server'));
    writeToConsole('Could not connect to server.py — is it running?', 'error');
  }
}

// ── dataset loading ────────────────────────────────────────────────────

async function refreshDatasets() {
  try {
    const data = await apiListInputs();
    populateInputSelects(data);
  } catch (err) {
    console.warn('refreshDatasets failed:', err);
  }
}

// ── simulated data ─────────────────────────────────────────────────────

async function generateData() {
  writeToConsole('Generating simulated GWAS dataset...', 'info');
  const btn = document.getElementById('genomics-sim-btn');
  if (btn) btn.disabled = true;

  try {
    const result = await apiGenerateSimulatedData();
    writeToConsole(result.success ? result.message : `Failed: ${result.message}`,
                   result.success ? 'success' : 'error');
    if (result.success) await refreshDatasets();
  } catch (err) {
    writeToConsole(`Error: ${err.message}`, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── PLINK ──────────────────────────────────────────────────────────────

async function runPlink() {
  const dataset = document.getElementById('plink-dataset-select')?.value;
  const type    = document.getElementById('plink-analysis-select')?.value;

  if (!dataset || dataset.startsWith('No')) {
    writeToConsole('Pick a dataset first — or generate the simulated one.', 'error');
    return;
  }

  writeToConsole(`Running PLINK ${type} on ${dataset}...`, 'info');
  showVisualizerLoading();

  try {
    const data = await apiRunPlink(dataset, type);

    printOutputToConsole(data.stdout, 'stdout');
    printOutputToConsole(data.stderr, 'stderr');

    if (data.success) {
      writeToConsole('PLINK finished.', 'success');
      const resultFile = data.result_files?.[type];
      if (resultFile) {
        loadAndRenderResult(resultFile, type);
      } else {
        writeToConsole('No result file in response — check the console output above.', 'error');
      }
    } else {
      writeToConsole(`PLINK exited with code ${data.returncode}.`, 'error');
      showVisualizerError('PLINK failed — see console for details.');
    }

  } catch (err) {
    writeToConsole(`PLINK error: ${err.message}`, 'error');
    showVisualizerError(err.message);
  }
}

// ── GATK ───────────────────────────────────────────────────────────────

async function runGatk() {
  const vcf = document.getElementById('gatk-vcf-select')?.value;

  if (!vcf || vcf.startsWith('No')) {
    writeToConsole('Select a VCF file first.', 'error');
    return;
  }

  writeToConsole(`Running GATK CountVariants on ${vcf}...`, 'info');
  writeToConsole('JVM startup can take a few seconds...', 'info');
  showVisualizerLoading();

  try {
    const data = await apiRunGatk(vcf, 'CountVariants');

    printOutputToConsole(data.stdout, 'stdout');
    printOutputToConsole(data.stderr, 'stderr');

    if (data.success) {
      writeToConsole('GATK finished.', 'success');
      // CountVariants prints the count to stdout, usually after "Tool returned:"
      let count = (data.stdout ?? '').trim();
      const m = count.match(/Tool returned:\s*(\d+)/i);
      if (m) count = m[1];
      displayGatkResult(count, vcf);
    } else {
      writeToConsole('GATK failed — check Java 17+ is installed.', 'error');
      showVisualizerError('GATK failed. Make sure Java 17+ and the GATK jar are in place.');
    }

  } catch (err) {
    writeToConsole(`GATK error: ${err.message}`, 'error');
    showVisualizerError(err.message);
  }
}

// ── result loading ─────────────────────────────────────────────────────

async function loadAndRenderResult(filePath, type) {
  writeToConsole(`Loading ${filePath}...`, 'info');
  try {
    const text = await apiReadResult(filePath);

    if (type === 'freq')        parseAndRenderFreq(text);
    else if (type === 'assoc')  parseAndRenderAssoc(text);
    else if (type === 'hardy')  parseAndRenderHwe(text);

  } catch (err) {
    writeToConsole(`Could not load result file: ${err.message}`, 'error');
    showVisualizerError(`Failed to read results: ${err.message}`);
  }
}

// genomics-api.js
// All the fetch calls to server.py live here so they're easy to find and test.
// Nothing fancy — just wrappers that throw on non-2xx so callers can catch.

const BASE = ''; // same origin as server.py

export async function apiGetStatus() {
  const res = await fetch(`${BASE}/api/status`);
  if (!res.ok) throw new Error(`/api/status returned ${res.status}`);
  return res.json();
}

export async function apiListInputs() {
  const res = await fetch(`${BASE}/api/list-inputs`);
  if (!res.ok) throw new Error(`/api/list-inputs returned ${res.status}`);
  return res.json();
}

export async function apiGenerateSimulatedData() {
  const res = await fetch(`${BASE}/api/generate-simulated-data`, { method: 'POST' });
  if (!res.ok) throw new Error(`generate-simulated-data returned ${res.status}`);
  return res.json();
}

// file = e.g. 'tools/alcoholism_study', type = 'freq' | 'assoc' | 'hardy'
export async function apiRunPlink(file, type) {
  const res = await fetch(`${BASE}/api/run-plink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, type }),
  });
  if (!res.ok) throw new Error(`/api/run-plink returned ${res.status}`);
  return res.json();
}

// tool is always 'CountVariants' for now
export async function apiRunGatk(file, tool = 'CountVariants') {
  const res = await fetch(`${BASE}/api/run-gatk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, tool }),
  });
  if (!res.ok) throw new Error(`/api/run-gatk returned ${res.status}`);
  return res.json();
}

export async function apiReadResult(filePath) {
  const res = await fetch(`${BASE}/api/read-result?file=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error(`/api/read-result returned ${res.status}`);
  return res.text();
}

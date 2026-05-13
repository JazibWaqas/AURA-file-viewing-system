import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const outputPath = path.join(frontendRoot, 'src', 'data', 'dashboardSnapshot.json');
const apiBaseUrl = process.env.VITE_BACKEND_URL || 'https://aura-file-viewing-system.onrender.com';

async function fetchJson(endpoint) {
  const response = await fetch(`${apiBaseUrl}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

const [yearlyData, fundingSources, patientData, storageStats] = await Promise.all([
  fetchJson('/api/dashboard/yearly-summary'),
  fetchJson('/api/dashboard/funding-sources'),
  fetchJson('/api/dashboard/patient-data'),
  fetchJson('/api/dashboard/storage-stats'),
]);

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: apiBaseUrl,
  yearlyData: Array.isArray(yearlyData) ? yearlyData : [],
  fundingSources: Array.isArray(fundingSources) ? fundingSources : [],
  patientData: Array.isArray(patientData) ? patientData : [],
  storageStats: storageStats || { totalFiles: 0, totalSize: 0, sizeUnit: 'MB' },
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote dashboard snapshot to ${path.relative(frontendRoot, outputPath)}`);

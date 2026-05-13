import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const outputPath = path.join(frontendRoot, 'src', 'data', 'fileSnapshot.json');
const apiBaseUrl = process.env.VITE_BACKEND_URL || 'https://aura-file-viewing-system.onrender.com';

function toIsoDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value._seconds) return new Date(value._seconds * 1000).toISOString();
  return null;
}

function normalizeFile(file) {
  return {
    _id: file._id,
    filename: file.filename || file.fileName || '',
    originalName: file.originalName || file.fileName || file.filename || '',
    fileType: file.fileType || '',
    mimetype: file.mimetype || '',
    category: file.category || '',
    subCategory: file.subCategory || '',
    year: file.year || '',
    month: file.month || '',
    description: file.description || '',
    size: file.size || 0,
    url: file.url || '',
    requiresAuth: Boolean(file.requiresAuth || file.private),
    createdAt: toIsoDate(file.createdAt || file.uploadedAt),
    updatedAt: toIsoDate(file.updatedAt || file.createdAt || file.uploadedAt),
  };
}

function buildCategories(files) {
  const categoryMap = new Map();

  files.forEach((file) => {
    if (!file.category) return;
    if (!categoryMap.has(file.category)) {
      categoryMap.set(file.category, new Set());
    }
    if (file.subCategory) {
      categoryMap.get(file.category).add(file.subCategory);
    }
  });

  return [...categoryMap.entries()]
    .map(([name, subCategories]) => ({
      name,
      subCategories: [...subCategories].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const response = await fetch(`${apiBaseUrl}/api/files`);

if (!response.ok) {
  throw new Error(`Failed to fetch file snapshot: ${response.status} ${response.statusText}`);
}

const files = (await response.json())
  .map(normalizeFile)
  .filter((file) => file._id)
  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: `${apiBaseUrl}/api/files`,
  files,
  categories: buildCategories(files),
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote ${files.length} files to ${path.relative(frontendRoot, outputPath)}`);

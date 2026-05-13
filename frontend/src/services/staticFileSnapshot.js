import snapshot from '../data/fileSnapshot.json';

export const staticFiles = Array.isArray(snapshot.files) ? snapshot.files : [];
export const staticCategories = Array.isArray(snapshot.categories) ? snapshot.categories : [];

export function sortFilesByDate(files) {
  return [...files].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function filterStaticFiles({ search = '', category = '', subCategory = '', year = '' } = {}) {
  const normalizedSearch = search.trim().toLowerCase();

  return sortFilesByDate(staticFiles).filter((file) => {
    if (category && file.category !== category) return false;
    if (subCategory && file.subCategory !== subCategory) return false;
    if (year && String(file.year) !== String(year)) return false;

    if (!normalizedSearch) return true;

    return [
      file.originalName,
      file.filename,
      file.description,
      file.category,
      file.subCategory,
      file.year,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });
}

export function getStaticFilesPage(filters, { limit = 16, startAfter = null } = {}) {
  const filteredFiles = filterStaticFiles(filters);
  const startIndex = startAfter
    ? Math.max(filteredFiles.findIndex((file) => file._id === startAfter) + 1, 0)
    : 0;
  const files = filteredFiles.slice(startIndex, startIndex + Number(limit));
  const lastVisible = files.length > 0 ? files[files.length - 1]._id : null;

  return {
    files,
    lastVisible,
    hasNextPage: startIndex + files.length < filteredFiles.length,
  };
}

export function findStaticFile(fileId) {
  return staticFiles.find((file) => file._id === fileId) || null;
}

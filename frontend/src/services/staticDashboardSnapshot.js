import snapshot from '../data/dashboardSnapshot.json';

export const staticYearlyData = Array.isArray(snapshot.yearlyData) ? snapshot.yearlyData : [];
export const staticFundingSources = Array.isArray(snapshot.fundingSources) ? snapshot.fundingSources : [];
export const staticPatientData = Array.isArray(snapshot.patientData) ? snapshot.patientData : [];
export const staticStorageStats = snapshot.storageStats || { totalFiles: 0, totalSize: 0, sizeUnit: 'MB' };

export function getLatestByYear(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.reduce((latest, item) => (Number(item.year) > Number(latest.year) ? item : latest));
}

export const staticLatestFunding = getLatestByYear(staticFundingSources) || {};

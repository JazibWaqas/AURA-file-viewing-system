const { db, bucket } = require('../config/firebase');

// Collection names
const YEARLY_SUMMARY_COLLECTION = 'dashboardYearlySummary';
const FUNDING_SOURCES_COLLECTION = 'dashboardFundingSources';

// Add yearly summary (year, totalRevenue, totalExpenses)
exports.addYearlySummary = async (req, res) => {
  try {
    const { year, totalRevenue, totalExpenses } = req.body;
    if (!year || !totalRevenue || !totalExpenses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await db.collection(YEARLY_SUMMARY_COLLECTION).doc(String(year)).set({
      year,
      totalRevenue,
      totalExpenses
    });
    res.status(201).json({ message: 'Yearly summary added/updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all yearly summaries (sorted by year asc)
exports.getYearlySummaries = async (req, res) => {
  try {
    const snapshot = await db.collection(YEARLY_SUMMARY_COLLECTION).orderBy('year', 'asc').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add funding sources for a year
exports.addFundingSources = async (req, res) => {
  try {
    const { year, donations, zakat, sponsorship, fees, other } = req.body;
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }
    await db.collection(FUNDING_SOURCES_COLLECTION).doc(String(year)).set({
      year,
      donations: donations || 0,
      zakat: zakat || 0,
      sponsorship: sponsorship || 0,
      fees: fees || 0,
      other: other || 0
    });
    res.status(201).json({ message: 'Funding sources added/updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get funding sources for a year (or all if no year param)
exports.getFundingSources = async (req, res) => {
  try {
    const { year } = req.query;
    let query = db.collection(FUNDING_SOURCES_COLLECTION);
    if (year) query = query.where('year', '==', Number(year));
    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete yearly summary for a year
exports.deleteYearlySummary = async (req, res) => {
  try {
    const { year } = req.params;
    await db.collection('dashboardYearlySummary').doc(String(year)).delete();
    res.json({ message: 'Yearly summary deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete funding sources for a year
exports.deleteFundingSources = async (req, res) => {
  try {
    const { year } = req.params;
    await db.collection('dashboardFundingSources').doc(String(year)).delete();
    res.json({ message: 'Funding sources deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get storage statistics (file count and total size) - INSTANT LOAD VERSION
exports.getStorageStats = async (req, res) => {
  try {
    // Always try to get cached stats first for instant response
    const cachedDoc = await db.collection('dashboardStats').doc('storage').get();
    
    if (cachedDoc.exists) {
      const cachedData = cachedDoc.data();
      
      // Return cached data immediately (instant response)
      res.json({
        totalFiles: cachedData.totalFiles,
        totalSizeBytes: cachedData.totalSizeBytes,
        totalSize: cachedData.totalSize,
        sizeUnit: cachedData.sizeUnit,
        estimated: false,
        cached: true,
        lastUpdated: cachedData.lastUpdated.toDate()
      });
      
      // Check if cache needs updating in the background (don't wait for response)
      const lastUpdated = cachedData.lastUpdated.toDate();
      const now = new Date();
      const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
      
      // If cache is older than 1 hour, update it in background
      if (hoursSinceUpdate >= 1) {
        updateStorageStatsInBackground().catch(error => {
          console.error('Background storage update failed:', error);
        });
      }
    } else {
      // No cache exists, return default values and update in background
      res.json({
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSize: 0,
        sizeUnit: 'MB',
        estimated: false,
        cached: false,
        lastUpdated: null
      });
      
      // Start background calculation immediately
      updateStorageStatsInBackground().catch(error => {
        console.error('Background storage update failed:', error);
      });
    }
  } catch (error) {
    console.error('Error getting storage stats:', error);
    // Return default values on error
    res.json({
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSize: 0,
      sizeUnit: 'MB',
      estimated: false,
      cached: false,
      lastUpdated: null
    });
  }
};

// Manual update storage stats endpoint
exports.updateStorageStats = async (req, res) => {
  try {
    // Start background calculation
    updateStorageStatsInBackground().catch(error => {
      console.error('Manual storage update failed:', error);
    });
    
    res.json({
      message: 'Storage stats update started in background',
      status: 'updating'
    });
  } catch (error) {
    console.error('Error starting storage update:', error);
    res.status(500).json({ error: error.message });
  }
};

// Background function to update storage stats (doesn't block response)
async function updateStorageStatsInBackground() {
  try {
    console.log('Starting background storage calculation...');
    const [files] = await bucket.getFiles();
    const totalFiles = files.length;
    
    let totalSizeBytes = 0;
    
    if (files.length > 0) {
      // Use exact calculation for up to 500 files
      const fileSizes = await Promise.all(
        files.map(async (file) => {
          try {
            const [metadata] = await file.getMetadata();
            return parseInt(metadata.size) || 0;
          } catch (error) {
            console.warn(`Could not get metadata for file ${file.name}:`, error.message);
            return 0;
          }
        })
      );
      totalSizeBytes = fileSizes.reduce((sum, size) => sum + size, 0);
    }
    
    // Convert to appropriate unit (MB or GB)
    let totalSize, sizeUnit;
    if (totalSizeBytes >= 1024 * 1024 * 1024) {
      totalSize = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
      sizeUnit = 'GB';
    } else {
      totalSize = (totalSizeBytes / (1024 * 1024)).toFixed(2);
      sizeUnit = 'MB';
    }
    
    // Update cache with new data
    await db.collection('dashboardStats').doc('storage').set({
      totalFiles,
      totalSizeBytes,
      totalSize: parseFloat(totalSize),
      sizeUnit,
      lastUpdated: new Date(),
      estimated: false
    });
    
    console.log('Background storage calculation completed:', { totalFiles, totalSize, sizeUnit });
  } catch (error) {
    console.error('Error in background storage calculation:', error);
  }
} 

// Patient Data Endpoints
const admin = require('firebase-admin');

exports.getPatientData = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('patientdata').orderBy('year', 'desc').get();
    const data = snapshot.docs.map(doc => doc.data());
    // Seed if empty
    if (data.length === 0) {
      await admin.firestore().collection('patientdata').add({ year: 2024, patients: 573 });
      return res.json([{ year: 2024, patients: 573 }]);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPatientData = async (req, res) => {
  try {
    const { year, patients } = req.body;
    if (!year || !patients) return res.status(400).json({ message: 'Year and patients required' });
    await admin.firestore().collection('patientdata').add({ year: Number(year), patients: Number(patients) });
    res.json({ message: 'Patient data added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
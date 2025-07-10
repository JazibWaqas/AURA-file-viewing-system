const { db } = require('../config/firebase');

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
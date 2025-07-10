const { db } = require('../config/firebase');
const chartDataCollection = db.collection('chartData');

exports.getAll = async (req, res) => {
  try {
    const snapshot = await chartDataCollection.orderBy('year').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { year, income, expenses, donations } = req.body;
    const docRef = await chartDataCollection.add({ year, income, expenses, donations });
    const newDoc = await docRef.get();
    res.status(201).json({ id: docRef.id, ...newDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, income, expenses, donations } = req.body;
    await chartDataCollection.doc(id).update({ year, income, expenses, donations });
    const updatedDoc = await chartDataCollection.doc(id).get();
    res.json({ id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
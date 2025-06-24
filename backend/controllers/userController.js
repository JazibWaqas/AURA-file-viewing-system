const { db } = require('../config/firebase');
const { sendApprovalEmail } = require('../services/emailService');

const usersCollection = db.collection('users');

// Called when a user logs in. Creates a user profile if one doesn't exist.
exports.handleUserLogin = async (req, res) => {
  const { uid, email, displayName } = req.body;
  try {
    const userDoc = await usersCollection.doc(uid).get();
    if (userDoc.exists) {
      // User exists, return their status
      res.status(200).json({ status: userDoc.data().status, ...userDoc.data() });
    } else {
      // New user, create a profile with 'pending' status
      const newUser = {
        uid,
        email,
        displayName,
        status: 'pending',
        createdAt: new Date(),
      };
      await usersCollection.doc(uid).set(newUser);
      // Send approval email
      await sendApprovalEmail(newUser);
      res.status(201).json({ status: 'pending', ...newUser });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a user
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await usersCollection.doc(userId).update({ status: 'approved' });
    res.send('<h1>User Approved</h1><p>You can now close this tab.</p>');
  } catch (error) {
    res.status(500).send('<h1>Error</h1><p>Could not approve user.</p>');
  }
};

// Deny a user
exports.denyUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await usersCollection.doc(userId).update({ status: 'denied' });
    res.send('<h1>User Denied</h1><p>You can now close this tab.</p>');
  } catch (error) {
    res.status(500).send('<h1>Error</h1><p>Could not deny user.</p>');
  }
};

// Get a user's status
exports.getUserStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const userDoc = await usersCollection.doc(userId).get();
        if (userDoc.exists) {
            res.status(200).json({ status: userDoc.data().status });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 
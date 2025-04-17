const express = require('express');
const router = express.Router();
const StoreLicense = require('../models/StoreLicense');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// Generate new license for a store
router.post('/generate', auth, async (req, res) => {
  try {
    const { storeId, renewalPeriod } = req.body;
    
    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Generate new license
    const license = new StoreLicense({
      storeId,
      licenseKey: StoreLicense.generateLicenseKey(),
      activationDate: new Date(),
      expirationDate: new Date(new Date().setMonth(new Date().getMonth() + renewalPeriod)),
      renewalPeriod
    });

    await license.save();
    res.status(201).json(license);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Activate license for a store
router.post('/activate', async (req, res) => {
  try {
    const { licenseKey, storeId } = req.body;
    
    const license = await StoreLicense.findOne({ licenseKey, storeId });
    if (!license) {
      return res.status(404).json({ message: 'Invalid license key' });
    }

    if (!license.isValid()) {
      return res.status(400).json({ message: 'License has expired or is invalid' });
    }

    // Update store status
    await Store.findByIdAndUpdate(storeId, { status: 'active' });
    res.json({ message: 'License activated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Check license status
router.get('/status/:storeId', auth, async (req, res) => {
  try {
    const license = await StoreLicense.findOne({ storeId: req.params.storeId });
    if (!license) {
      return res.status(404).json({ message: 'No license found for this store' });
    }

    res.json({
      status: license.status,
      isValid: license.isValid(),
      expirationDate: license.expirationDate,
      remainingDays: Math.ceil((license.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Renew license
router.post('/renew/:storeId', auth, async (req, res) => {
  try {
    const { renewalPeriod } = req.body;
    const license = await StoreLicense.findOne({ storeId: req.params.storeId });
    
    if (!license) {
      return res.status(404).json({ message: 'No license found for this store' });
    }

    license.expirationDate = new Date(new Date().setMonth(new Date().getMonth() + renewalPeriod));
    license.lastRenewalDate = new Date();
    license.status = 'active';

    await license.save();
    res.json({ message: 'License renewed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { broadcastAlertUpdate } = require('../server');

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unacknowledged alerts
router.get('/unacknowledged', async (req, res) => {
  try {
    const alerts = await Alert.find({ acknowledged: false })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Broadcast alert update
    broadcastAlertUpdate({
      type: 'alertUpdate',
      alertId: alert._id,
      status: 'acknowledged'
    });

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create alert
router.post('/', async (req, res) => {
  try {
    const alert = new Alert({
      type: req.body.type,
      message: req.body.message,
      severity: req.body.severity,
      scannerId: req.body.scannerId
    });

    const newAlert = await alert.save();

    // Broadcast new alert
    broadcastAlertUpdate({
      type: 'newAlert',
      alert: newAlert
    });

    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get alert summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await Alert.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            acknowledged: '$acknowledged'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
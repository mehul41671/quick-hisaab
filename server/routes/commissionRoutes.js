const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');

// Get all commissions for a scanner
router.get('/scanners/:scannerId/commissions', commissionController.getCommissions);

// Add a new commission
router.post('/scanners/:scannerId/commissions', commissionController.addCommission);

// Update commission status
router.patch('/scanners/:scannerId/commissions/:commissionId', commissionController.updateCommissionStatus);

// Get commission summary
router.get('/scanners/:scannerId/commissions/summary', commissionController.getCommissionSummary);

module.exports = router; 
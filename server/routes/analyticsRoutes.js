const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get scanner metrics
router.get('/scanners/:scannerId/metrics', analyticsController.getScannerMetrics);

// Get system health metrics
router.get('/scanners/:scannerId/health', analyticsController.getSystemHealth);

// Get commission analytics
router.get('/scanners/:scannerId/commissions/analytics', analyticsController.getCommissionAnalytics);

module.exports = router; 
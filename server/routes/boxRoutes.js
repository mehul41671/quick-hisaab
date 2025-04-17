const express = require('express');
const router = express.Router();
const boxController = require('../controllers/boxController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all active boxes
router.get('/active', authMiddleware, boxController.getActiveBoxes);

// Scan ticket
router.post('/:boxId/scan', authMiddleware, boxController.scanTicket);

// Add manual entry
router.post('/:boxId/manual-entry', authMiddleware, boxController.addManualEntry);

// Create new box
router.post('/', authMiddleware, boxController.createBox);

// Update box metrics
router.put('/:boxId/metrics', authMiddleware, boxController.updateBoxMetrics);

// Get box metrics history
router.get('/:boxId/metrics-history', authMiddleware, boxController.getBoxMetricsHistory);

// Get all boxes
router.get('/', boxController.getBoxes);

// Get a single box
router.get('/:id', boxController.getBox);

// Update box status
router.put('/:id/status', boxController.updateBoxStatus);

// Get box alerts
router.get('/:id/alerts', boxController.getBoxAlerts);

// Clear box alerts
router.delete('/:id/alerts', boxController.clearBoxAlerts);

module.exports = router; 
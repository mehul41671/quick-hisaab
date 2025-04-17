const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const auth = require('../middleware/auth');

// Scanner Management Routes
router.post('/', auth, scannerController.createScanner);
router.get('/', auth, scannerController.getScanners);
router.put('/:id', auth, scannerController.updateScanner);
router.delete('/:id', auth, scannerController.deleteScanner);

// Scanner Health and Status Routes
router.get('/:id/health', auth, scannerController.checkHealth);
router.get('/:id/metrics', auth, scannerController.getMetrics);

// Scanner Profile Routes
router.post('/profiles', auth, scannerController.saveProfile);
router.get('/profiles', auth, scannerController.getProfiles);

// Scanner Event Routes
router.post('/events', auth, scannerController.createEvent);

// Firmware Management Routes
router.post('/:id/firmware', auth, scannerController.updateFirmware);
router.get('/:id/firmware/version', auth, scannerController.getFirmwareVersion);

// Scanner Calibration Routes
router.post('/:id/calibrate', auth, scannerController.calibrate);
router.get('/:id/calibration', auth, scannerController.getCalibration);

// Diagnostics Routes
router.post('/:id/diagnostics', auth, scannerController.runDiagnostics);
router.get('/:id/diagnostics/report', auth, scannerController.getDiagnosticReport);

module.exports = router; 
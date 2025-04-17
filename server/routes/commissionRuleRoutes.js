const express = require('express');
const router = express.Router();
const commissionRuleController = require('../controllers/commissionRuleController');

// Get all commission rules for a scanner
router.get('/scanners/:scannerId/rules', commissionRuleController.getCommissionRules);

// Create a new commission rule
router.post('/scanners/:scannerId/rules', commissionRuleController.createCommissionRule);

// Update a commission rule
router.put('/scanners/:scannerId/rules/:ruleId', commissionRuleController.updateCommissionRule);

// Delete a commission rule
router.delete('/scanners/:scannerId/rules/:ruleId', commissionRuleController.deleteCommissionRule);

// Calculate commission
router.post('/scanners/:scannerId/calculate', commissionRuleController.calculateCommission);

module.exports = router; 
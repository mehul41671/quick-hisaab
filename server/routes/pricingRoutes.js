const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get current pricing
router.get('/', pricingController.getPricing);

// Update pricing (admin only)
router.put('/', auth, admin, pricingController.updatePricing);

module.exports = router; 
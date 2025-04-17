const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Get available subscription plans
router.get('/plans', subscriptionController.getPlans);

// Create new subscription
router.post('/', authMiddleware, subscriptionController.createSubscription);

// Update subscription
router.put('/:subscriptionId', authMiddleware, subscriptionController.updateSubscription);

// Cancel subscription
router.delete('/:subscriptionId', authMiddleware, subscriptionController.cancelSubscription);

// Get subscription status
router.get('/status/:storeId', authMiddleware, subscriptionController.getSubscriptionStatus);

module.exports = router; 
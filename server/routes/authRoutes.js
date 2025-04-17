const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login', authController.login);

// Verify token route
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router; 
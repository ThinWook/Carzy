const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidators, loginValidators } = require('../middleware/validators/authValidators');

// POST /api/auth/register
router.post('/register', registerValidators, authController.register);

// POST /api/auth/login
router.post('/login', loginValidators, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/current-user (protected)
router.get('/current-user', protect, authController.getCurrentUser);

module.exports = router;

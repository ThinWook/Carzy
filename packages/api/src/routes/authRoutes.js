const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { registerValidators, loginValidators } = require('../middleware/validators/authValidators');

// POST /api/auth/register
router.post('/register', registerValidators, userController.registerUser);

// POST /api/auth/login
router.post('/login', loginValidators, userController.loginUser);

// GET /api/auth/current-user (protected)
router.get('/current-user', protect, userController.getUserProfile);

module.exports = router;

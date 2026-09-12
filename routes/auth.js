const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/me (protected)
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile (protected)
router.put('/profile', auth, updateProfile);

// @route   PUT /api/auth/password (protected)
router.put('/password', auth, updatePassword);

module.exports = router;

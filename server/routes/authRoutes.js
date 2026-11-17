const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
} = require('../controllers/authController');

const {
    validateRegistration,
    validateLogin
} = require('../middleware/validation');

// Registration Route
router.post('/register', validateRegistration, registerUser);

// Login Route
router.post('/login', validateLogin, loginUser);

router.post('/logout', logoutUser);

// Current logged-in user
router.get('/me', requireAuth, getCurrentUser);

module.exports = router;
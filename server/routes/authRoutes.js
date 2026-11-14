const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser
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

module.exports = router;
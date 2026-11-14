const User = require('../models/User');
const bcrypt = require('bcrypt');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, location, description, occupation } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            location,
            description,
            occupation
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser._id
        });

    } catch (error) {
        res.status(500).json({
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        req.session.regenerate((error) => {
    if (error) {
        return res.status(500).json({
            message: 'Session creation failed'
        });
    }

    req.session.userId = user._id.toString();

    req.session.save((error) => {
        if (error) {
            return res.status(500).json({
                message: 'Session saving failed'
            });
        }

        res.status(200).json({
            message: 'Login successful',
            userId: user._id
        });
    });
});

    } catch (error) {
        res.status(500).json({
            message: 'Login failed',
            error: error.message
        });
    }
};

// Logout user
const logoutUser = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: 'Logout failed'
            });
        }

        res.clearCookie('connect.sid');

        res.status(200).json({
            message: 'Logout successful'
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
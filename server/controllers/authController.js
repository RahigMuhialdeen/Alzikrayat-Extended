const User = require('../models/User');
const bcrypt = require('bcrypt');

// Public profile: never expose the password hash
const toPublicProfile = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    location: user.location,
    description: user.description,
    occupation: user.occupation
});

// Register a new user
const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            location,
            description,
            occupation
        } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            location,
            description,
            occupation
        });

        await newUser.save();

        return res.status(201).json({
            message: 'User registered successfully',
            userId: newUser._id
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            message: 'Registration failed'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(409).json({
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Regenerate session after successful login
        req.session.regenerate((error) => {
            if (error) {
                console.error('Session regeneration error:', error);

                return res.status(500).json({
                    message: 'Session creation failed'
                });
            }

            req.session.userId = user._id.toString();

            // Save session before sending response
            req.session.save((error) => {
                if (error) {
                    console.error('Session saving error:', error);

                    return res.status(500).json({
                        message: 'Session saving failed'
                    });
                }

                return res.status(200).json({
                    message: 'Login successful',
                    userId: user._id,
                    user: toPublicProfile(user)
                });
            });
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Login failed'
        });
    }
};

// Get the logged-in user (restores the session after a page refresh)
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(401).json({
                message: 'Not logged in'
            });
        }

        return res.status(200).json({
            userId: user._id,
            user: toPublicProfile(user)
        });

    } catch (error) {
        console.error('Current user error:', error);

        return res.status(500).json({
            message: 'Failed to load current user'
        });
    }
};

// Logout user
const logoutUser = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);

            return res.status(500).json({
                message: 'Logout failed'
            });
        }

        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return res.status(200).json({
            message: 'Logout successful'
        });
    });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
};
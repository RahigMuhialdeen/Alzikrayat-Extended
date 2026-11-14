const fs = require('fs');

// Registration Validation
const validateRegistration = (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        password
    } = req.body;

    if (!firstName || !firstName.trim()) {
        return res.status(400).json({
            message: 'First name is required'
        });
    }

    if (!lastName || !lastName.trim()) {
        return res.status(400).json({
            message: 'Last name is required'
        });
    }

    if (!email || !email.trim()) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            message: 'Please enter a valid email address'
        });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
        });
    }

    next();
};

// Login Validation
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            message: 'Please enter a valid email address'
        });
    }

    if (!password || !password.trim()) {
        return res.status(400).json({
            message: 'Password is required'
        });
    }

    next();
};

// Comment Validation
const validateComment = (req, res, next) => {
    const { photoId, comment } = req.body;

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!photoId || !objectIdRegex.test(photoId)) {
        return res.status(400).json({
            message: 'A valid photo ID is required'
        });
    }

    if (!comment || !comment.trim()) {
        return res.status(400).json({
            message: 'Comment cannot be empty'
        });
    }

    next();
};

// Reject Photo Upload
const rejectPhotoUpload = (req, res, message) => {
    const sendResponse = () => {
        return res.status(400).json({
            message
        });
    };

    if (!req.file) {
        return sendResponse();
    }

    fs.unlink(req.file.path, (error) => {
        if (error) {
            console.error('Failed to delete uploaded file:', error);
        }

        sendResponse();
    });
};

// Photo Validation
const validatePhoto = (req, res, next) => {
    const { title } = req.body;

    if (!title || !title.trim()) {
        return rejectPhotoUpload(
            req,
            res,
            'Photo title is required'
        );
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateComment,
    validatePhoto
};
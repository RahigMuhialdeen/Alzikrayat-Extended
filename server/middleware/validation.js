const Joi = require('joi')
const fs = require('fs')

// Registration Schema
const registrationSchema = Joi.object({
    firstName: Joi.string().trim().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required'
        
    }),

    lastName: Joi.string().trim().required().messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required'
    }),

    email: Joi.string().trim().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),

    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password must be at least 8 characters long',
        'any.required': 'Password must be at least 8 characters long'
    }),

    location: Joi.string().allow('').optional(),

    description: Joi.string().allow('').optional(),

    occupation: Joi.string().allow('').optional()
})

// Login Schema
const loginSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),

    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
})

// Comment Schema
const commentSchema = Joi.object({
    comment: Joi.string().trim().required().messages({
        'string.empty': 'Comment cannot be empty',
        'any.required': 'Comment cannot be empty'
    })
})

// General Validation Function
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body)

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }

        req.body = value
        next()
    }
}

// Registration Validation
const validateRegistration = validate(registrationSchema)

// Login Validation
const validateLogin = validate(loginSchema)

// Comment Validation
const validateComment = validate(commentSchema)

// Reject Photo Upload
const rejectPhotoUpload = (req, res, message) => {
    const sendResponse = () => {
        return res.status(400).json({ message })
    }

    if (!req.file) {
        return sendResponse()
    }

    fs.unlink(req.file.path, (error) => {
        if (error) {
            console.error('Failed to delete uploaded file:', error)
        }

        sendResponse()
    })
}

// Photo Validation
const validatePhoto = (req, res, next) => {
    const photoSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        'string.empty': 'Photo title is required',
        'any.required': 'Photo title is required'
    }),

    description: Joi.string().allow('').optional()
})
    const { error, value } = photoSchema.validate(req.body)

    if (error) {
        return rejectPhotoUpload(
            req,
            res,
            error.details[0].message
        )
    }

    req.body = value
    next()
}

module.exports = {
    validateRegistration,
    validateLogin,
    validateComment,
    validatePhoto
}
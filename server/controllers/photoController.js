const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const { emitToPhoto, emitToAll } = require('../socket');
const mongoose = require('mongoose');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Allowed image formats
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

// Check image type
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error(
            'Only JPEG, PNG, and WebP image files are allowed'
        );
        error.statusCode = 400;
        cb(error, false);
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Get all photos
const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photo.find()
    .populate('userId', 'firstName lastName')
    .sort({ dateTime: -1 });

        res.status(200).json(photos);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve photos',
            error: error.message
        });
    }
};

// Get a single photo
const getPhotoById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: 'Invalid photo ID'
    });
}
        const photo = await Photo.findById(req.params.id)
            .populate('userId', 'firstName lastName');

        if (!photo) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        res.status(200).json(photo);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve photo',
            error: error.message
        });
    }
};

// Upload a new photo
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload a photo'
            });
        }

        const { title, description } = req.body;
const userId = req.session.userId;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: 'Photo title is required'
            });
        }

        const newPhoto = new Photo({
            userId,
            fileName: req.file.filename,
            title,
            description
        });

        await newPhoto.save();

        // Real-time (optional feature): live notification for other users
        emitToAll(req.app.get('io'), 'photo:uploaded', {
            photoId: newPhoto._id.toString(),
            title: newPhoto.title,
            uploaderId: userId
        });

        res.status(201).json({
            message: 'Photo uploaded successfully',
            photo: newPhoto
        });

    } catch (error) {
    // Delete the uploaded file if saving fails
    if (req.file && req.file.path) {
        try {
            await fs.promises.unlink(req.file.path);
        } catch (fileError) {
            if (fileError.code !== 'ENOENT') {
                console.error('Uploaded file cleanup failed:', fileError);
            }
        }
    }

    console.error('Photo upload failed:', error);

    res.status(500).json({
        message: 'Photo upload failed',
        error: error.message
    });
}
};

// Delete a photo
const deletePhoto = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: 'Invalid photo ID'
    });
}

        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        if (photo.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this photo'
            });
        }
        await Comment.deleteMany({ photoId: photo._id });

        await Photo.findByIdAndDelete(req.params.id);

        // Delete the physical image file
        const filePath = path.join(
            __dirname,
            '..',
            'uploads',
            path.basename(photo.fileName)
        );

        try {
            await fs.promises.unlink(filePath);
        } catch (fileError) {
            if (fileError.code !== 'ENOENT') {
                console.error('Image file deletion failed:', fileError);
            }
        }

        // Real-time: tell anyone still viewing this photo that it is gone
        emitToPhoto(req.app.get('io'), photo._id, 'photo:deleted', {
            photoId: photo._id.toString()
        });

        res.status(200).json({
            message: 'Photo and its file deleted successfully'
        });

    } catch (error) {
        console.error('Photo deletion failed:', error);

        res.status(500).json({
            message: 'Photo deletion failed'
        });
    }
};

module.exports = {
    getAllPhotos,
    getPhotoById,
    uploadPhoto,
    deletePhoto,
    upload
};

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

const {
    getAllPhotos,
    getPhotoById,
    uploadPhoto,
    deletePhoto,
    upload
} = require('../controllers/photoController');

const {
    validatePhoto
} = require('../middleware/validation');

// Get all photos
router.get('/', getAllPhotos);

// Get a single photo
router.get('/:id', getPhotoById);

// Upload a photo
router.post(
    '/upload',
    requireAuth,
    upload.single('photo'),
    validatePhoto,
    uploadPhoto
);

// Delete a photo
router.delete('/:id', requireAuth, deletePhoto);

module.exports = router;
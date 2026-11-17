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
    getCommentsByPhoto,
    addComment
} = require('../controllers/commentController');

const {
    validatePhoto,
    validateComment
} = require('../middleware/validation');

// Photos
router.get('/', getAllPhotos);
router.get('/:id', getPhotoById);
router.post('/', requireAuth, upload.single('photo'), validatePhoto, uploadPhoto);
router.delete('/:id', requireAuth, deletePhoto);

// Comments of a photo
router.get('/:id/comments', getCommentsByPhoto);
router.post('/:id/comments', requireAuth, validateComment, addComment);

module.exports = router;

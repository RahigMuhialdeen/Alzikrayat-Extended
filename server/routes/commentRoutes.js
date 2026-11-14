const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

const {
    getCommentsByPhoto,
    addComment,
    deleteComment
} = require('../controllers/commentController');

const {
    validateComment
} = require('../middleware/validation');

// Get comments for a photo
router.get('/:photoId', getCommentsByPhoto);

// Add a new comment
router.post('/', requireAuth, validateComment, addComment);

// Delete a comment
router.delete('/:id', deleteComment);

module.exports = router;
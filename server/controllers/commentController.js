const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Photo = require('../models/Photo');
const { emitToPhoto } = require('../socket');

// Get all comments for a photo
const getCommentsByPhoto = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: 'Invalid photo ID'
    });
}
        const comments = await Comment.find({
            photoId: req.params.id
        })
            .populate('userId', 'firstName lastName')
            .sort({ dateTime: -1 });

        res.status(200).json(comments);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve comments',
            error: error.message
        });
    }
};

// Add a new comment
const addComment = async (req, res) => {
    try {
        const photoId = req.params.id;
        const { comment } = req.body;
const userId = req.session.userId;

if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).json({
        message: 'Invalid photo ID'
    });
}

        const photoExists = await Photo.exists({ _id: photoId });

        if (!photoExists) {
            return res.status(404).json({
                message: 'Photo not found'
            });
        }

        const newComment = new Comment({
            photoId,
            userId,
            comment
        });

        await newComment.save();

        // Include the author's name so clients can render it immediately
        await newComment.populate('userId', 'firstName lastName');

        // Real-time: push the new comment to everyone viewing this photo
        emitToPhoto(
            req.app.get('io'),
            photoId,
            'comment:new',
            newComment.toJSON()
        );

        res.status(201).json({
            message: 'Comment added successfully',
            newComment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid comment ID'
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this comment'
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        // Real-time: remove the comment from other viewers' screens
        emitToPhoto(
            req.app.get('io'),
            comment.photoId,
            'comment:deleted',
            {
                commentId: comment._id.toString(),
                photoId: comment.photoId.toString()
            }
        );

        res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete comment',
            error: error.message
        });
    }
};

module.exports = {
    getCommentsByPhoto,
    addComment,
    deleteComment
};
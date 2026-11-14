const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Handle Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'Image size must not exceed 5 MB'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Image upload error: ' + err.message
        });
    }

    // Handle other errors
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.statusCode
            ? err.message
            : 'Internal Server Error'
    });
};

module.exports = errorHandler;
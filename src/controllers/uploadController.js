const UploadJob = require('../models/UploadJob');
const { processUpload } = require('../services/csvProcessor');
const path = require('path');

// @desc    Upload a CSV file for processing
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create UploadJob entry
        const uploadJob = await UploadJob.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl: req.file.path, // Storing local path for now
            status: 'Pending'
        });

        // Trigger async processing
        processUpload(uploadJob._id, req.file.path);

        res.status(202).json({
            message: 'File uploaded and processing started',
            uploadJob
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's upload history
// @route   GET /api/upload
// @access  Private
const getUploads = async (req, res) => {
    try {
        const uploads = await UploadJob.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(uploads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    uploadFile,
    getUploads
};

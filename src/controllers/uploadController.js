const UploadJob = require('../models/UploadJob');
const { processUpload } = require('../services/csvProcessor');
const path = require('path');
const { logAction } = require('../services/auditService');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const uploadJob = await UploadJob.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl: req.file.path,
            status: 'Pending'
        });

        processUpload(uploadJob._id, req.file.path);

        logAction(req.user._id, 'UPLOAD_STARTED', uploadJob._id, 'UploadJob', { filename: req.file.originalname }, req.ip);

        res.status(202).json({
            message: 'File uploaded and processing started',
            uploadJob
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUploads = async (req, res) => {
    try {
        let query = { user: req.user._id };

        // Admin sees all uploads
        if (req.user.role === 'Admin') {
            query = {};
        }

        const uploads = await UploadJob.find(query).sort({ createdAt: -1 });
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

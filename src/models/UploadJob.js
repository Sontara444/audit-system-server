const mongoose = require('mongoose');

const uploadJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed'],
        default: 'Pending'
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    processedRecords: {
        type: Number,
        default: 0
    },
    errorLog: {
        type: String
    }
}, {
    timestamps: true
});

const UploadJob = mongoose.model('UploadJob', uploadJobSchema);

module.exports = UploadJob;

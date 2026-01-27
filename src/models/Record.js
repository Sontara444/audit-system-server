const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    uploadJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadJob',
        required: true
    },
    data: {
        type: Map,
        of: String
    },
    reconciliationStatus: {
        type: String,
        enum: ['Unmatched', 'Matched', 'Partial', 'Duplicate'],
        default: 'Unmatched'
    },
    reconciliationDetails: {
        type: String
    }
}, {
    timestamps: true
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;

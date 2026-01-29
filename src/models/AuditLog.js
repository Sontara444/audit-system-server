const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['UPLOAD_STARTED', 'UPLOAD_COMPLETED', 'UPLOAD_FAILED', 'RECON_STARTED', 'RECON_COMPLETED', 'RECORD_FLAGGED', 'LOGIN', 'REGISTER']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    targetType: {
        type: String,
        enum: ['UploadJob', 'Record', 'User'],
        required: true
    },
    details: {
        type: Map,
        of: String
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

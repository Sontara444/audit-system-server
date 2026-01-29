const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, targetId, targetType, details = {}, ipAddress = null) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            targetId,
            targetType,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Audit Logging Failed:', error);
    }
};

module.exports = { logAction };

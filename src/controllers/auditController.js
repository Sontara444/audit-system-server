const AuditLog = require('../models/AuditLog');


const getAuditLogs = async (req, res) => {
    try {
        const { action, targetType, page = 1, limit = 50 } = req.query;
        const query = {};

        if (action) query.action = action;
        if (targetType) query.targetType = targetType;

        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .populate('user', 'username role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAuditStats = async (req, res) => {
    try {
        const totalLogs = await AuditLog.countDocuments();
        const actionsByType = await AuditLog.aggregate([
            { $group: { _id: "$action", count: { $sum: 1 } } }
        ]);

        res.json({
            totalLogs,
            actionsByType
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAuditLogs,
    getAuditStats
};

const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Allow all authenticated users to view logs (for Dashboard timeline)
router.get('/', protect, getAuditLogs);
router.get('/stats', protect, authorize('Admin'), getAuditStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin'), getAuditLogs);
router.get('/stats', protect, authorize('Admin'), getAuditStats);

module.exports = router;

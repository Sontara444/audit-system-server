const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAuditLogs);
router.get('/stats', protect, getAuditStats);

module.exports = router;

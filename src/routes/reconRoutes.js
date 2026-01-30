const express = require('express');
const router = express.Router();
const { triggerRecon, getReconStats, getReconRecords, updateRecordStatus } = require('../controllers/reconController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, authorize('Admin', 'Analyst'), triggerRecon);
router.get('/:jobId/stats', protect, getReconStats);
router.get('/:jobId/records', protect, getReconRecords);
router.put('/records/:recordId', protect, authorize('Admin', 'Analyst'), updateRecordStatus);

module.exports = router;

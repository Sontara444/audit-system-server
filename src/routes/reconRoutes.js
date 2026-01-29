const express = require('express');
const router = express.Router();
const { triggerRecon, getReconStats, getReconRecords, updateRecordStatus } = require('../controllers/reconController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, triggerRecon);
router.get('/:jobId/stats', protect, getReconStats);
router.get('/:jobId/records', protect, getReconRecords);
router.put('/records/:recordId', protect, updateRecordStatus);

module.exports = router;

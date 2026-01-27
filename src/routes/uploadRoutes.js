const express = require('express');
const router = express.Router();
const { uploadFile, getUploads } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('file'), uploadFile);
router.get('/', protect, getUploads);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createUrl, getUserUrls, deleteUrl, bulkUploadUrls, getUrlStats } = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');

// Initialize multer memory storage configuration
const upload = multer({ storage: multer.memoryStorage() });

// Public Route: Fetch analytics data for any short code
router.get('/stats/:code', getUrlStats);

// Protected Routes: Require token to create, list, delete, or bulk upload URLs
router.post('/create', authMiddleware, createUrl);
router.get('/list', authMiddleware, getUserUrls);
router.delete('/delete/:id', authMiddleware, deleteUrl);
router.post('/bulk-upload', authMiddleware, upload.single('file'), bulkUploadUrls);

module.exports = router;

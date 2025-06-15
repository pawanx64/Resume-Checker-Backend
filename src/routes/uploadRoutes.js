// backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/uploadController');

// Define the route for file upload and analysis
router.post('/upload', uploadResume);

module.exports = router;
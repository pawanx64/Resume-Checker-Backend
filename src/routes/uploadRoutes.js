const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/uploadController');

router.post('/upload', uploadResume);

module.exports = router;
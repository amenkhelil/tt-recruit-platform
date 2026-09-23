const express = require('express');
const filesController = require('../controllers/files.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/resumes/:resumeId', authenticate, filesController.downloadResume);

module.exports = router;
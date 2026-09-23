const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/profile', require('./profile.routes'));
router.use('/jobs', require('./job.routes'));
router.use('/resumes', require('./resume.routes'));
router.use('/applications', require('./application.routes'));
router.use('/files', require('./files.routes'));

module.exports = router;

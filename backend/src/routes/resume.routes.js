const express = require('express');
const resumeController = require('../controllers/resume.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadResumeMiddleware, persistResume } = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate, authorize('jobseeker'));

router.post('/', uploadResumeMiddleware, persistResume, resumeController.upload);
router.get('/', resumeController.list);
router.get('/:id', resumeController.getById);
router.patch('/:id/primary', resumeController.setPrimary);
router.delete('/:id', resumeController.remove);

module.exports = router;
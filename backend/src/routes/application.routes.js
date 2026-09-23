const express = require('express');
const applicationController = require('../controllers/application.controller');
const { authenticate, authorize, requireVerifiedEmail } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('jobseeker'), requireVerifiedEmail, applicationController.apply);
router.get('/mine', authorize('jobseeker'), applicationController.myApplications);
router.get(
  '/job/:jobId',
  authorize('recruiter', 'admin'),
  applicationController.applicantsForJob
);
router.get('/:id', applicationController.getById);
router.patch(
  '/:id/status',
  authorize('recruiter', 'admin'),
  applicationController.updateStatus
);

module.exports = router;
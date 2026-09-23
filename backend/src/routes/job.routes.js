const express = require('express');
const jobController = require('../controllers/job.controller');
const { authenticate, authorize, requireVerifiedEmail } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('recruiter', 'admin'),
  requireVerifiedEmail,
  jobController.create
);
router.get('/', jobController.search);
router.get('/mine', authenticate, authorize('recruiter', 'admin'), jobController.myJobs);
router.get('/stats', authenticate, authorize('recruiter', 'admin'), jobController.stats);
router.get('/:id', jobController.getById);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), jobController.update);
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), jobController.remove);

module.exports = router;
const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadAvatarMiddleware, persistAvatar } = require('../middlewares/upload');

const router = express.Router();

router.use(authenticate);

router.get('/', profileController.getMine);
router.patch('/', profileController.updateMine);
router.post('/avatar', uploadAvatarMiddleware, persistAvatar, profileController.uploadAvatar);

module.exports = router;
const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/verify-email', otpLimiter, authController.verifyEmail);
router.post('/resend-otp', otpLimiter, authController.resendVerificationOtp);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', otpLimiter, authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
const Joi = require('joi');
const User = require('../models/User');
const Profile = require('../models/Profile');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const {
  generateAccessToken,
  generateRefreshTokenValue,
  hashToken,
  generateOtpCode,
  hashOtpCode,
} = require('../utils/token');
const { sendOtpEmail } = require('../utils/email');

const REFRESH_COOKIE_NAME = 'refreshToken';
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const passwordRule = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    'string.pattern.base': 'Password must contain a lowercase, an uppercase and a number',
    'string.min': 'Password must be at least 8 characters',
  });

const schemas = {
  register: Joi.object({
    fullName: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: passwordRule.required(),
    phone: Joi.string().trim().allow('', null),
  }),
  verifyEmail: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
  resendOtp: Joi.object({ userId: Joi.string().hex().length(24).required() }),
  login: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
  }),
  forgotPassword: Joi.object({ email: Joi.string().trim().lowercase().email().required() }),
  resetPassword: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: passwordRule.required(),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordRule.required(),
  }),
};

function validateBody(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
  return value;
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: env.JWT_REFRESH_EXPIRES_IN_MS,
    path: '/api/auth',
  };
}

async function generateAndSendOtp(user, fullName, purpose) {
  await OTP.updateMany({ user: user._id, purpose, consumed: false }, { consumed: true });
  const code = generateOtpCode();
  await OTP.create({
    user: user._id,
    codeHash: hashOtpCode(code),
    purpose,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });
  await sendOtpEmail({ to: user.email, fullName, code, purpose });
}

async function verifyOtp(userId, purpose, submittedCode) {
  const otpRecord = await OTP.findOne({
    user: userId,
    purpose,
    consumed: false,
    expiresAt: { $gt: new Date() },
  }).sort('-createdAt');

  if (!otpRecord) throw ApiError.badRequest('No active verification code found. Request a new one.');
  if (otpRecord.attempts >= 5) {
    await OTP.findByIdAndUpdate(otpRecord._id, { consumed: true });
    throw ApiError.badRequest('Maximum attempts exceeded. Request a new code.');
  }
  if (hashOtpCode(submittedCode) !== otpRecord.codeHash) {
    await OTP.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
    throw ApiError.badRequest('Invalid verification code');
  }
  await OTP.findByIdAndUpdate(otpRecord._id, { consumed: true });
}

async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshTokenValue();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_MS),
  });
  return { accessToken, refreshToken: rawRefreshToken };
}

// ---- Handlers ----

async function register(req, res, next) {
  try {
    const body = validateBody(schemas.register, req.body);

    const exists = await User.findOne({ email: body.email });
    if (exists) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await User.hashPassword(body.password);
    const user = await User.create({
      email: body.email,
      passwordHash,
      role: 'jobseeker',
    });
    await Profile.create({ user: user._id, fullName: body.fullName, phone: body.phone || null });

    await generateAndSendOtp(user, body.fullName, 'email_verification');

    return sendResponse(
      res,
      201,
      { userId: user._id, email: user.email, role: user.role },
      'Registration successful. Check your email for the verification code.'
    );
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const body = validateBody(schemas.verifyEmail, req.body);
    const user = await User.findById(body.userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isEmailVerified) throw ApiError.badRequest('Email already verified');

    await verifyOtp(body.userId, 'email_verification', body.code);
    user.isEmailVerified = true;
    await user.save();

    return sendResponse(res, 200, user.toSafeJSON(), 'Email verified successfully');
  } catch (err) {
    next(err);
  }
}

async function resendVerificationOtp(req, res, next) {
  try {
    const body = validateBody(schemas.resendOtp, req.body);
    const user = await User.findById(body.userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isEmailVerified) throw ApiError.badRequest('Email already verified');

    const profile = await Profile.findOne({ user: user._id });
    await generateAndSendOtp(user, profile?.fullName || 'User', 'email_verification');

    return sendResponse(res, 200, null, 'A new verification code has been sent');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const body = validateBody(schemas.login, req.body);

    const user = await User.findOne({ email: body.email }).select('+passwordHash');
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (user.status !== 'active') throw ApiError.forbidden('This account is suspended');

    const isValid = await user.comparePassword(body.password);
    if (!isValid) throw ApiError.unauthorized('Invalid email or password');

    const { accessToken, refreshToken } = await issueTokenPair(user);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return sendResponse(res, 200, { user: user.toSafeJSON(), accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token missing');

    const tokenHash = hashToken(rawRefreshToken);
    const existing = await RefreshToken.findOne({ tokenHash });
    if (!existing || existing.revoked) throw ApiError.unauthorized('Invalid or revoked refresh token');
    if (existing.expiresAt < new Date()) throw ApiError.unauthorized('Refresh token expired');

    const user = await User.findById(existing.user);
    if (!user || user.status !== 'active') throw ApiError.unauthorized('User no longer active');

    const { accessToken, refreshToken: newRawToken } = await issueTokenPair(user);
    existing.revoked = true;
    await existing.save();

    res.cookie(REFRESH_COOKIE_NAME, newRawToken, refreshCookieOptions());
    return sendResponse(res, 200, { user: user.toSafeJSON(), accessToken }, 'Session refreshed');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (rawRefreshToken) {
      await RefreshToken.updateOne({ tokenHash: hashToken(rawRefreshToken) }, { revoked: true });
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    return sendResponse(res, 200, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const body = validateBody(schemas.forgotPassword, req.body);
    const user = await User.findOne({ email: body.email });

    if (user) {
      const profile = await Profile.findOne({ user: user._id });
      await generateAndSendOtp(user, profile?.fullName || 'User', 'password_reset');
    }

    return sendResponse(res, 200, null, 'If this email exists, a reset code has been sent');
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const body = validateBody(schemas.resetPassword, req.body);
    const user = await User.findOne({ email: body.email });
    if (!user) throw ApiError.badRequest('Invalid request');

    await verifyOtp(user._id, 'password_reset', body.code);

    user.passwordHash = await User.hashPassword(body.newPassword);
    await user.save();
    await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

    return sendResponse(res, 200, null, 'Password has been reset successfully');
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const body = validateBody(schemas.changePassword, req.body);
    const user = await User.findById(req.user.id).select('+passwordHash');

    const isValid = await user.comparePassword(body.currentPassword);
    if (!isValid) throw ApiError.badRequest('Current password is incorrect');

    user.passwordHash = await User.hashPassword(body.newPassword);
    await user.save();
    await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

    return sendResponse(res, 200, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    return sendResponse(res, 200, req.user, 'Current session');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerificationOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw ApiError.unauthorized(
        err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.status !== 'active') throw ApiError.forbidden('Account is suspended');

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (user && user.status === 'active') {
      req.user = { id: user._id.toString(), role: user.role, email: user.email };
    }
  } catch (err) {
    // token invalide sur une route optionnelle -> on ignore simplement
  }
  next();
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required role: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}

function requireVerifiedEmail(req, res, next) {
  if (!req.user.isEmailVerified) {
    return next(ApiError.forbidden('Email verification required'));
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate, authorize, requireVerifiedEmail };
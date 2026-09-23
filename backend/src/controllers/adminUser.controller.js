const Joi = require('joi');
const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');

const passwordRule = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    'string.pattern.base': 'Password must contain a lowercase, an uppercase and a number',
    'string.min': 'Password must be at least 8 characters',
  });

const schemas = {
  createInternalUser: Joi.object({
    fullName: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: passwordRule.required(),
    phone: Joi.string().trim().allow('', null),
    role: Joi.string().valid('recruiter', 'admin').required(),
  }),
  updateUser: Joi.object({
    fullName: Joi.string().trim().min(2).max(120),
    phone: Joi.string().trim().allow('', null),
    role: Joi.string().valid('jobseeker', 'recruiter', 'admin'),
    status: Joi.string().valid('active', 'suspended'),
    isEmailVerified: Joi.boolean(),
  }).min(1),
};

function validateBody(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
  return value;
}

async function createInternalUser(req, res, next) {
  try {
    const body = validateBody(schemas.createInternalUser, req.body);

    const exists = await User.findOne({ email: body.email });
    if (exists) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await User.hashPassword(body.password);
    const user = await User.create({
      email: body.email,
      passwordHash,
      role: body.role,
      isEmailVerified: true,
    });

    await Profile.create({ user: user._id, fullName: body.fullName, phone: body.phone || null });

    return sendResponse(
      res,
      201,
      { user: user.toSafeJSON() },
      `${body.role} account created successfully`
    );
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -__v')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return sendResponse(res, 200, items, 'Users retrieved', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const body = validateBody(schemas.updateUser, req.body);
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User not found');

    if (user._id.toString() === req.user.id && body.status === 'suspended') {
      throw ApiError.badRequest('You cannot suspend your own account');
    }

    const userUpdates = {};
    if (body.role) userUpdates.role = body.role;
    if (body.status) userUpdates.status = body.status;
    if (typeof body.isEmailVerified === 'boolean') {
      userUpdates.isEmailVerified = body.isEmailVerified;
    }

    if (Object.keys(userUpdates).length > 0) {
      Object.assign(user, userUpdates);
      await user.save();
    }

    const profileUpdates = {};
    if (body.fullName) profileUpdates.fullName = body.fullName;
    if (Object.prototype.hasOwnProperty.call(body, 'phone')) profileUpdates.phone = body.phone;

    if (Object.keys(profileUpdates).length > 0) {
      await Profile.findOneAndUpdate(
        { user: user._id },
        { $set: profileUpdates },
        { new: true, runValidators: true, upsert: true }
      );
    }

    return sendResponse(res, 200, { user: user.toSafeJSON() }, 'User updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { createInternalUser, listUsers, updateUser };

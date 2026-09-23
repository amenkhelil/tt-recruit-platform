const Joi = require('joi');
const path = require('path');
const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');

const schemas = {
  update: Joi.object({
    fullName: Joi.string().trim().min(2).max(120),
    phone: Joi.string().trim().allow('', null),
    bio: Joi.string().trim().max(500).allow(''),
    headline: Joi.string().trim().max(150).allow(''),
    location: Joi.string().trim().allow(''),
  }).min(1),
};

function validateBody(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
  return value;
}

async function getMine(req, res, next) {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) throw ApiError.notFound('Profile not found');
    return sendResponse(res, 200, profile);
  } catch (err) {
    next(err);
  }
}

async function updateMine(req, res, next) {
  try {
    const body = validateBody(schemas.update, req.body);
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!profile) throw ApiError.notFound('Profile not found');
    return sendResponse(res, 200, profile, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.uploadedFile) throw ApiError.badRequest('No avatar file provided');

    const avatarUrl = `/uploads/${req.uploadedFile.filePath.split(path.sep).join('/')}`;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { avatarUrl } },
      { new: true }
    );
    if (!profile) throw ApiError.notFound('Profile not found');

    return sendResponse(res, 200, profile, 'Avatar updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getMine, updateMine, uploadAvatar };
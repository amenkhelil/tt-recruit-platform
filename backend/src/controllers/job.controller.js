const Joi = require('joi');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const { sendNewJobEmail } = require('../utils/email');

const schemas = {
  create: Joi.object({
    title: Joi.string().trim().min(3).max(150).required(),
    description: Joi.string().trim().min(20).required(),
    missionText: Joi.string().trim().allow(''),
    responsibilities: Joi.array().items(Joi.string().trim()).default([]),
    requiredSkills: Joi.array().items(Joi.string().trim()).default([]),
    degree: Joi.string().trim().allow(''),
    experienceYearsMin: Joi.number().integer().min(0).max(50).default(0),
    location: Joi.string().trim().required(),
    contractType: Joi.string().valid('CDI', 'CDD', 'Stage', 'Freelance', 'Alternance').required(),
    department: Joi.string().trim().allow(''),
    openPositions: Joi.number().integer().min(1).default(1),
    closingDate: Joi.date().greater('now').required(),
  }),
  update: Joi.object({
    title: Joi.string().trim().min(3).max(150),
    description: Joi.string().trim().min(20),
    missionText: Joi.string().trim().allow(''),
    responsibilities: Joi.array().items(Joi.string().trim()),
    requiredSkills: Joi.array().items(Joi.string().trim()),
    degree: Joi.string().trim().allow(''),
    experienceYearsMin: Joi.number().integer().min(0).max(50),
    location: Joi.string().trim(),
    contractType: Joi.string().valid('CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'),
    department: Joi.string().trim().allow(''),
    openPositions: Joi.number().integer().min(1),
    status: Joi.string().valid('draft', 'active', 'closed', 'expired'),
    closingDate: Joi.date(),
  }).min(1),
};

function validateBody(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
  return value;
}

async function notifyJobSeekersOfNewJob(job) {
  const jobSeekers = await User.find({ role: 'jobseeker', status: 'active', isEmailVerified: true });
  const profiles = await Profile.find({ user: { $in: jobSeekers.map((u) => u._id) } });
  const profileMap = new Map(profiles.map((p) => [p.user.toString(), p.fullName]));

  for (const user of jobSeekers) {
    // eslint-disable-next-line no-await-in-loop
    await sendNewJobEmail({
      to: user.email,
      fullName: profileMap.get(user._id.toString()) || 'Candidat',
      jobTitle: job.title,
      location: job.location,
      jobUrl: `${env.CLIENT_URL}/jobs/${job._id}`,
    });
  }
}

async function create(req, res, next) {
  try {
    const body = validateBody(schemas.create, req.body);

    const job = await Job.create({ ...body, postedBy: req.user.id, status: 'active' });

    notifyJobSeekersOfNewJob(job).catch((err) =>
      console.error(`Failed to notify jobseekers: ${err.message}`)
    );

    return sendResponse(res, 201, job, 'Job posted successfully');
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');
    return sendResponse(res, 200, job);
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    const filter = { status: 'active' };

    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');
    if (req.query.contractType) filter.contractType = req.query.contractType;

    let query;
    if (req.query.keyword) {
      query = Job.find({ ...filter, $text: { $search: req.query.keyword } });
    } else {
      query = Job.find(filter);
    }

    const [items, total] = await Promise.all([
      query
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    return sendResponse(res, 200, items, 'Jobs retrieved', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function myJobs(req, res, next) {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort('-createdAt');
    return sendResponse(res, 200, jobs);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const body = validateBody(schemas.update, req.body);
    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to update this job');
    }
    Object.assign(job, body);
    await job.save();
    return sendResponse(res, 200, job, 'Job updated successfully');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to delete this job');
    }
    await job.deleteOne();
    return sendResponse(res, 200, null, 'Job deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const jobFilter =
      req.user.role === 'admin' ? {} : { postedBy: new mongoose.Types.ObjectId(req.user.id) };

    const [jobsCount, activeJobsCount, jobIds] = await Promise.all([
      Job.countDocuments(jobFilter),
      Job.countDocuments({ ...jobFilter, status: 'active' }),
      Job.find(jobFilter).distinct('_id'),
    ]);

    const [applicationsCount, pendingCount, shortlistedCount, acceptedCount, rejectedCount] =
      await Promise.all([
        Application.countDocuments({ job: { $in: jobIds } }),
        Application.countDocuments({ job: { $in: jobIds }, status: 'pending' }),
        Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' }),
        Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' }),
        Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' }),
      ]);

    return sendResponse(res, 200, {
      jobsCount,
      activeJobsCount,
      applicationsCount,
      pendingCount,
      shortlistedCount,
      acceptedCount,
      rejectedCount,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, search, myJobs, update, remove, stats };

const Joi = require('joi');
const axios = require('axios');
const Application = require('../models/Application');
const AIResult = require('../models/AIResult');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const { sendApplicationStatusEmail } = require('../utils/email');

const schemas = {
  apply: Joi.object({
    jobId: Joi.string().hex().length(24).required(),
    resumeId: Joi.string().hex().length(24).required(),
    coverLetter: Joi.string().trim().max(3000).allow(''),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('shortlisted', 'accepted', 'rejected').required(),
  }),
};

function validateBody(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
  return value;
}

const ALLOWED_TRANSITIONS = {
  pending: ['shortlisted', 'rejected'],
  shortlisted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

async function triggerScoring(applicationId) {
  const application = await Application.findById(applicationId).populate('resume').populate('job');
  if (!application) return;

  const resume = application.resume;
  const job = application.job;

  if (!resume || resume.extractionStatus !== 'completed' || !resume.extractedText) {
    application.scoringStatus = 'failed';
    await application.save();
    return;
  }

  application.scoringStatus = 'processing';
  await application.save();

  const jobText = [job.title, job.description, job.missionText, ...(job.responsibilities || [])]
    .filter(Boolean)
    .join('\n');

  try {
    const response = await axios.post(
      `${env.AI_SERVICE_URL}/api/v1/matching/score`,
      {
        resumeText: resume.extractedText,
        resumeSkills: resume.skills,
        resumeYearsExperience: resume.yearsOfExperience,
        jobText,
        requiredSkills: job.requiredSkills,
        experienceYearsMin: job.experienceYearsMin,
      },
      { headers: { 'X-API-Key': env.AI_SERVICE_API_KEY }, timeout: 120000 }
    );

    const data = response.data;

    await AIResult.findOneAndUpdate(
      { application: applicationId },
      {
        application: applicationId,
        semanticScore: data.semanticScore,
        skillScore: data.skillScore,
        experienceScore: data.experienceScore,
        finalScore: data.finalScore,
        matchedSkills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
        extractedYearsExperience: resume.yearsOfExperience,
        requiredYearsExperience: job.experienceYearsMin,
        explanation: data.explanation || '',
        modelVersion: data.modelVersion || 'unknown',
        computedAt: new Date(),
      },
      { upsert: true }
    );

    application.matchScore = data.finalScore;
    application.scoringStatus = 'completed';
    await application.save();
  } catch (err) {
    console.error(`AI scoring failed for application ${applicationId}: ${err.message}`);
    application.scoringStatus = 'failed';
    await application.save();
  }
}

async function apply(req, res, next) {
  try {
    const body = validateBody(schemas.apply, req.body);

    const job = await Job.findById(body.jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (job.status !== 'active') throw ApiError.badRequest('This job is no longer accepting applications');
    if (job.closingDate < new Date()) throw ApiError.badRequest('The application deadline has passed');

    const resume = await Resume.findById(body.resumeId);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.user.toString() !== req.user.id) {
      throw ApiError.forbidden('You can only apply with your own resume');
    }

    const existingApplication = await Application.findOne({
      job: body.jobId,
      applicant: req.user.id,
    });
    if (existingApplication) {
      throw ApiError.conflict('You have already applied to this job');
    }

    const application = await Application.create({
      job: body.jobId,
      applicant: req.user.id,
      resume: body.resumeId,
      coverLetter: body.coverLetter || '',
      status: 'pending',
      statusHistory: [{ status: 'pending', changedAt: new Date() }],
      scoringStatus: 'pending',
    });

    await Job.findByIdAndUpdate(body.jobId, { $inc: { applicantsCount: 1 } });

    triggerScoring(application._id).catch((err) =>
      console.error(`Scoring trigger failed: ${err.message}`)
    );

    const populated = await Application.findById(application._id).populate('job', 'title location');
    return sendResponse(res, 201, populated, 'Application submitted successfully');
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title location postedBy')
      .populate('resume', 'fileName filePath')
      .populate('applicant', 'email');
    if (!application) throw ApiError.notFound('Application not found');

    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isRecruiterOwner = application.job.postedBy.toString() === req.user.id;
    if (!isApplicant && !isRecruiterOwner && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have access to this application');
    }

    const aiResult = await AIResult.findOne({ application: application._id });
    return sendResponse(res, 200, { application, aiResult });
  } catch (err) {
    next(err);
  }
}

async function myApplications(req, res, next) {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title location contractType')
      .sort('-appliedAt');
    return sendResponse(res, 200, applications);
  } catch (err) {
    next(err);
  }
}

async function applicantsForJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to view these applicants');
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'email')
      .populate('resume', 'fileName filePath')
      .sort('-matchScore');

    return sendResponse(res, 200, applications);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const body = validateBody(schemas.updateStatus, req.body);

    const application = await Application.findById(req.params.id).populate('job').populate('applicant');
    if (!application) throw ApiError.notFound('Application not found');

    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to update this application');
    }

    if (!ALLOWED_TRANSITIONS[application.status]?.includes(body.status)) {
      throw ApiError.badRequest(
        `Invalid status transition from '${application.status}' to '${body.status}'`
      );
    }

    application.status = body.status;
    application.statusHistory.push({ status: body.status, changedAt: new Date() });
    await application.save();

    const profile = await Profile.findOne({ user: application.applicant._id });
    await sendApplicationStatusEmail({
      to: application.applicant.email,
      fullName: profile?.fullName || 'Candidat',
      jobTitle: application.job.title,
      status: body.status,
    });

    return sendResponse(res, 200, application, 'Application status updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { apply, getById, myApplications, applicantsForJob, updateStatus };

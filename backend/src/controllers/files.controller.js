const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const { UPLOAD_ROOT } = require('../middlewares/upload');

async function downloadResume(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) throw ApiError.notFound('Resume not found');

    const isOwner = resume.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    let isRecruiterForResume = false;

    if (!isOwner && req.user.role === 'recruiter') {
      const applications = await Application.find({ resume: resume._id }).populate('job', 'postedBy');
      isRecruiterForResume = applications.some(
        (application) => application.job?.postedBy?.toString() === req.user.id
      );
    }

    if (!isOwner && !isAdmin && !isRecruiterForResume) {
      throw ApiError.forbidden('You do not have access to this file');
    }

    const absolutePath = path.join(UPLOAD_ROOT, resume.filePath);
    if (!fs.existsSync(absolutePath)) throw ApiError.notFound('File not found on server');

    res.setHeader('Content-Type', resume.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resume.fileName)}"`);
    return res.sendFile(absolutePath);
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadResume };

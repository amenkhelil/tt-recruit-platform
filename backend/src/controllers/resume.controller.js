const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const env = require('../config/env');
const { UPLOAD_ROOT } = require('../middlewares/upload');

async function runExtraction(resumeId) {
  const resume = await Resume.findById(resumeId);
  if (!resume) return;

  const absolutePath = path.join(UPLOAD_ROOT, resume.filePath);
  const fileBuffer = fs.readFileSync(absolutePath);

  try {
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: resume.fileName,
      contentType: resume.mimeType,
    });

    const response = await axios.post(`${env.AI_SERVICE_URL}/api/v1/resume/extract`, form, {
      headers: { ...form.getHeaders(), 'X-API-Key': env.AI_SERVICE_API_KEY },
      timeout: 120000,
    });

    const data = response.data;
    resume.extractedText = data.rawText || '';
    resume.skills = data.skills || [];
    resume.experiences = data.experiences || [];
    resume.education = data.education || [];
    resume.certifications = data.certifications || [];
    resume.languages = data.languages || [];
    resume.yearsOfExperience = data.yearsOfExperience || 0;
    resume.extractionStatus = 'completed';
    resume.extractionError = '';
    await resume.save();
  } catch (err) {
    const detail = err.response?.data?.detail;
    const errorMessage = Array.isArray(detail) ? detail.map((item) => item.msg).join('; ') : detail;
    resume.extractionError = errorMessage || err.message || 'Resume extraction failed';
    console.error(`Resume extraction failed for ${resumeId}: ${resume.extractionError}`);
    resume.extractionStatus = 'failed';
    await resume.save();
  }
}

async function upload(req, res, next) {
  try {
    if (!req.uploadedFile) throw ApiError.badRequest('No file uploaded');

    const existingCount = await Resume.countDocuments({ user: req.user.id });

    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.uploadedFile.fileName,
      filePath: req.uploadedFile.filePath,
      fileSize: req.uploadedFile.fileSize,
      mimeType: req.uploadedFile.mimeType,
      isPrimary: existingCount === 0,
      extractionStatus: 'pending',
      extractionError: '',
    });

    runExtraction(resume._id).catch((err) =>
      console.error(`Extraction pipeline error: ${err.message}`)
    );

    return sendResponse(
      res,
      201,
      resume,
      'Resume uploaded successfully. Text extraction is in progress.'
    );
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort('-uploadedAt');
    return sendResponse(res, 200, resumes);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.user.toString() !== req.user.id) {
      throw ApiError.forbidden('You do not have access to this resume');
    }
    return sendResponse(res, 200, resume);
  } catch (err) {
    next(err);
  }
}

async function setPrimary(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.user.toString() !== req.user.id) {
      throw ApiError.forbidden('You do not have access to this resume');
    }

    await Resume.updateMany({ user: req.user.id }, { isPrimary: false });
    resume.isPrimary = true;
    await resume.save();

    return sendResponse(res, 200, resume, 'Primary resume updated');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.user.toString() !== req.user.id) {
      throw ApiError.forbidden('You do not have access to this resume');
    }

    const absolutePath = path.join(UPLOAD_ROOT, resume.filePath);
    await resume.deleteOne();
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);

    if (resume.isPrimary) {
      const remaining = await Resume.findOne({ user: req.user.id }).sort('-uploadedAt');
      if (remaining) {
        remaining.isPrimary = true;
        await remaining.save();
      }
    }

    return sendResponse(res, 200, null, 'Resume deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, list, getById, setPrimary, remove };

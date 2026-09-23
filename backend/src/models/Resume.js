const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    startYear: { type: Number, default: null },
    endYear: { type: Number, default: null },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: Date, default: null },
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
      default: 'conversational',
    },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },

    extractedText: { type: String, default: '' },
    extractionStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    extractionError: { type: String, default: '' },

    skills: { type: [String], default: [] },
    experiences: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    yearsOfExperience: { type: Number, default: 0 },

    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, isPrimary: 1 });

module.exports = mongoose.model('Resume', resumeSchema);

const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },
    semanticScore: { type: Number, required: true, min: 0, max: 100 },
    skillScore: { type: Number, required: true, min: 0, max: 100 },
    experienceScore: { type: Number, required: true, min: 0, max: 100 },
    finalScore: { type: Number, required: true, min: 0, max: 100, index: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    extractedYearsExperience: { type: Number, default: 0 },
    requiredYearsExperience: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    modelVersion: { type: String, default: 'all-MiniLM-L6-v2' },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIResult', aiResultSchema);
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true },
    missionText: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },
    degree: { type: String, default: '' },
    experienceYearsMin: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true, trim: true },
    contractType: {
      type: String,
      enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'],
      required: true,
    },
    department: { type: String, default: '' },
    openPositions: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'expired'],
      default: 'active',
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicantsCount: { type: Number, default: 0 },
    closingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, location: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);

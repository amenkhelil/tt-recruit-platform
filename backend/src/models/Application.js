const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    coverLetter: { type: String, default: '', maxlength: 3000 },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    statusHistory: {
      type: [
        {
          status: String,
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    matchScore: { type: Number, default: null, min: 0, max: 100 },
    scoringStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index(
  { applicant: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'shortlisted', 'accepted'] } },
  }
);

applicationSchema.index({ job: 1, matchScore: -1 });

module.exports = mongoose.model('Application', applicationSchema);
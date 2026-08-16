const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, default: null },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    headline: { type: String, trim: true, maxlength: 150, default: '' },
    avatarUrl: { type: String, default: null },
    location: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
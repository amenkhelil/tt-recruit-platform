require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseDurationToMs(duration, fallbackMs) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return fallbackMs;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  MONGO_URI: required('MONGO_URI'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN_MS: parseDurationToMs(JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000),

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'TT Recruit System <no-reply@ttrecruit.tn>',

  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY || '',

  MAX_RESUME_SIZE_MB: parseInt(process.env.MAX_RESUME_SIZE_MB || '5', 10),
  MAX_AVATAR_SIZE_MB: parseInt(process.env.MAX_AVATAR_SIZE_MB || '2', 10),
};
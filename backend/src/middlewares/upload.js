const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { fromBuffer } = require('file-type');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

const ALLOWED_RESUME_TYPES = ['application/pdf'];
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function buildMulter(maxSizeMb) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });
}

const uploadResumeMiddleware = buildMulter(env.MAX_RESUME_SIZE_MB).single('resume');
const uploadAvatarMiddleware = buildMulter(env.MAX_AVATAR_SIZE_MB).single('avatar');

function persistFile({ subFolder, allowedMimeTypes, fieldLabel }) {
  return async (req, res, next) => {
    try {
      if (!req.file) throw ApiError.badRequest(`No ${fieldLabel} file provided`);

      const detected = await fromBuffer(req.file.buffer);
      if (!detected || !allowedMimeTypes.includes(detected.mime)) {
        throw ApiError.badRequest(`Invalid ${fieldLabel} file type`);
      }

      const userId = req.user?.id || 'anonymous';
      const targetDir = path.join(UPLOAD_ROOT, subFolder, userId);
      ensureDir(targetDir);

      const uniqueName = `${uuidv4()}.${detected.ext}`;
      const absolutePath = path.join(targetDir, uniqueName);
      fs.writeFileSync(absolutePath, req.file.buffer);

      req.uploadedFile = {
        fileName: req.file.originalname,
        filePath: path.relative(UPLOAD_ROOT, absolutePath),
        fileSize: req.file.size,
        mimeType: detected.mime,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}

const persistResume = persistFile({
  subFolder: 'resumes',
  allowedMimeTypes: ALLOWED_RESUME_TYPES,
  fieldLabel: 'resume',
});

const persistAvatar = persistFile({
  subFolder: 'avatars',
  allowedMimeTypes: ALLOWED_AVATAR_TYPES,
  fieldLabel: 'avatar',
});

module.exports = { uploadResumeMiddleware, uploadAvatarMiddleware, persistResume, persistAvatar, UPLOAD_ROOT };
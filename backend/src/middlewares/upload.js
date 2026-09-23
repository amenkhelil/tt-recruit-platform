const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { fromBuffer } = require('file-type');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

const ALLOWED_RESUME_TYPES = [
  { ext: 'pdf', mime: 'application/pdf' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: 'odt', mime: 'application/vnd.oasis.opendocument.text' },
];
const ALLOWED_AVATAR_TYPES = [
  { ext: 'jpg', mime: 'image/jpeg' },
  { ext: 'jpeg', mime: 'image/jpeg' },
  { ext: 'png', mime: 'image/png' },
  { ext: 'webp', mime: 'image/webp' },
];

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

function getAllowedFileInfo(file, detected, allowedTypes) {
  const originalExt = path.extname(file.originalname || '').slice(1).toLowerCase();
  const candidates = [
    detected?.mime,
    file.mimetype,
  ].filter(Boolean);

  return allowedTypes.find(
    (type) =>
      candidates.includes(type.mime) ||
      (originalExt === type.ext && (detected?.mime === 'application/zip' || !detected))
  );
}

function persistFile({ subFolder, allowedTypes, fieldLabel }) {
  return async (req, res, next) => {
    try {
      if (!req.file) throw ApiError.badRequest(`No ${fieldLabel} file provided`);

      const detected = await fromBuffer(req.file.buffer);
      const fileInfo = getAllowedFileInfo(req.file, detected, allowedTypes);
      if (!fileInfo) {
        throw ApiError.badRequest(`Invalid ${fieldLabel} file type`);
      }

      const userId = req.user?.id || 'anonymous';
      const targetDir = path.join(UPLOAD_ROOT, subFolder, userId);
      ensureDir(targetDir);

      const uniqueName = `${uuidv4()}.${fileInfo.ext}`;
      const absolutePath = path.join(targetDir, uniqueName);
      fs.writeFileSync(absolutePath, req.file.buffer);

      req.uploadedFile = {
        fileName: req.file.originalname,
        filePath: path.relative(UPLOAD_ROOT, absolutePath),
        fileSize: req.file.size,
        mimeType: fileInfo.mime,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}

const persistResume = persistFile({
  subFolder: 'resumes',
  allowedTypes: ALLOWED_RESUME_TYPES,
  fieldLabel: 'resume',
});

const persistAvatar = persistFile({
  subFolder: 'avatars',
  allowedTypes: ALLOWED_AVATAR_TYPES,
  fieldLabel: 'avatar',
});

module.exports = { uploadResumeMiddleware, uploadAvatarMiddleware, persistResume, persistAvatar, UPLOAD_ROOT };

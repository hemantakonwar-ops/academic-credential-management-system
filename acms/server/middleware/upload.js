const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !allowedExts.includes(ext)) {
    return cb(
      new Error('Invalid file type. Only PDF, PNG, and JPG/JPEG files are allowed.'),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

// Server-side MIME verification after multer
const verifyMimeType = (req, res, next) => {
  if (!req.file) return next();
  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Server validation failed: unsupported MIME type.',
    });
  }
  next();
};

module.exports = { upload, verifyMimeType };

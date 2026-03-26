const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const uploadDir = path.join(process.cwd(), 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname || 'product', ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 40);

    cb(
      cb ? null : undefined,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`
    );
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed', 400));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 8,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;

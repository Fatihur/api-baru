const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/x-m4a',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: images, videos, audio, documents`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Cleanup old files function (optional, can be scheduled)
function cleanupOldFiles(maxAgeHours = 24) {
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  files.forEach(file => {
    if (file === '.gitignore') return;
    
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      } catch (error) {
        console.error(`Failed to delete ${file}:`, error.message);
      }
    }
  });
}

// Get file type category from mimetype
function getFileCategory(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
}

module.exports = {
  upload,
  cleanupOldFiles,
  getFileCategory,
  uploadsDir
};

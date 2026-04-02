const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');

// Support both key file path (local) and JSON string (Heroku)
let storageOptions = {};
if (process.env.GCS_KEY_JSON) {
  storageOptions = { credentials: JSON.parse(process.env.GCS_KEY_JSON) };
} else {
  storageOptions = { keyFilename: process.env.GCS_KEY_FILE || path.join(__dirname, '../config/gcs-key.json') };
}

const storage = new Storage(storageOptions);

const bucket = storage.bucket(process.env.GCS_BUCKET || 'milk-and-honey');

const multerStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

const uploadToGCS = (folder = 'uploads') => {
  return async (req, res, next) => {
    if (!req.file) return next();

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname);
    const filename = `${folder}/${uniqueSuffix}${ext}`;

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error('GCS upload error:', err);
      return res.status(500).json({ message: 'Failed to upload image' });
    });

    blobStream.on('finish', () => {
      req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      next();
    });

    blobStream.end(req.file.buffer);
  };
};

const uploadMultipleToGCS = (folder = 'uploads') => {
  return async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = `${folder}/${uniqueSuffix}${ext}`;

        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
          resumable: false,
          metadata: { contentType: file.mimetype },
        });

        blobStream.on('error', reject);
        blobStream.on('finish', () => {
          file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          resolve();
        });

        blobStream.end(file.buffer);
      });
    });

    try {
      await Promise.all(uploadPromises);
      next();
    } catch (err) {
      console.error('GCS multi-upload error:', err);
      return res.status(500).json({ message: 'Failed to upload images' });
    }
  };
};

const deleteFromGCS = async (url) => {
  if (!url || !url.includes('storage.googleapis.com')) return;
  try {
    const filename = url.split(`${bucket.name}/`)[1];
    if (filename) {
      await bucket.file(filename).delete();
    }
  } catch (err) {
    console.error('GCS delete error:', err.message);
  }
};

module.exports = {
  upload,
  uploadToGCS,
  uploadMultipleToGCS,
  deleteFromGCS,
};

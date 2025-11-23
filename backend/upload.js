const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
  folder: 'eduportal_files', // Cloudinary folder name
  resource_type: 'auto',    // Use raw for PDFs and docs
  access_mode: 'public', // make file public
   },
});

const parser = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      return cb(new Error('Video files are not allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = parser;

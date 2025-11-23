// cleanupDeletedFiles.js
// Permanently delete files soft-deleted for over 3 months from DB and Cloudinary

const mongoose = require('mongoose');
const Pdf = require('./models/Pdf');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanupDeletedFiles() {
  await mongoose.connect(process.env.MONGO_URI);
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const filesToDelete = await Pdf.find({ deleted: true, deletedAt: { $lt: threeMonthsAgo } });
  console.log(`[CLEANUP] Found ${filesToDelete.length} files to permanently delete.`);

  for (const file of filesToDelete) {
    // Remove from Cloudinary if fileUrl exists and is a Cloudinary URL
    if (file.fileUrl && file.fileUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from fileUrl
        const matches = file.fileUrl.match(/\/v\d+\/([^\.]+)\./);
        const publicId = matches ? matches[1] : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`[CLOUDINARY] Deleted file: ${publicId}`);
        }
      } catch (err) {
        console.error(`[CLOUDINARY] Error deleting file: ${file.fileUrl}`, err);
      }
    }
    // Remove from DB
    await Pdf.deleteOne({ _id: file._id });
    console.log(`[DB] Permanently deleted PDF: ${file._id}`);
  }
  await mongoose.disconnect();
  console.log('[CLEANUP] Finished.');
}

if (require.main === module) {
  cleanupDeletedFiles();
}

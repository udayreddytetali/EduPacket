// monthlyCleanup.js
// Run this script once a month to permanently delete files soft-deleted for 3+ months

const mongoose = require('mongoose');
const Pdf = require('./models/Pdf');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function monthlyCleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const filesToDelete = await Pdf.find({ deleted: true, deletedAt: { $lte: threeMonthsAgo } });
  console.log(`[MONTHLY CLEANUP] Found ${filesToDelete.length} files to permanently delete.`);

  for (const file of filesToDelete) {
    if (file.fileUrl && file.fileUrl.includes('cloudinary.com')) {
      try {
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
    await Pdf.deleteOne({ _id: file._id });
    console.log(`[DB] Permanently deleted PDF: ${file._id}`);
  }
  await mongoose.disconnect();
  console.log('[MONTHLY CLEANUP] Finished.');
}

if (require.main === module) {
  monthlyCleanup();
}

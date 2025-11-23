const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const parser = require('../upload');
const Pdf = require('../models/Pdf');

// Bulk delete all PDFs and model papers (admin only)
router.delete('/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await Pdf.deleteMany({});
    res.json({ message: 'All PDFs and model papers deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('[PDF BULK DELETE] ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all PDFs/model papers for a specific subject (classGroup) (admin only)
router.delete('/subject/:classGroup', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { classGroup } = req.params;
    if (!classGroup) return res.status(400).json({ message: 'classGroup param required' });
    const result = await Pdf.deleteMany({ classGroup });
    res.json({ message: `All PDFs/model papers for subject '${classGroup}' deleted`, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('[PDF SUBJECT DELETE] ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload file - Allowed roles: admin, teacher, cr
router.post(
  '/upload',
  authenticateToken,
  (req, res, next) => {
    console.log('[PDF UPLOAD] Middleware: req.user:', req.user);
    if (!['admin', 'teacher', 'cr'].includes(req.user.role)) {
      console.log('[PDF UPLOAD] REJECTED: role is', req.user.role);
      return res.status(403).json({ message: 'Access denied: insufficient role (middleware)' });
    }
    console.log('[PDF UPLOAD] PASSED: role is', req.user.role);
    next();
  },
  parser.single('file'),
  async (req, res) => {
    try {
      console.log('[PDF UPLOAD] Handler: req.user:', req.user);
      console.log('[PDF UPLOAD] req.file:', req.file);
      if (!req.file) {
        console.error('[PDF UPLOAD] No file uploaded. req.body:', req.body);
        return res.status(400).json({ message: 'No file uploaded', body: req.body });
      }
      const { title, classGroup, year, semester } = req.body;
      if (!year || !semester) {
        return res.status(400).json({ message: 'Year and semester are required.' });
      }
      // Optionally, validate year/semester values here (e.g., against allowed list)
      console.log('[PDF UPLOAD] Uploaded file mimetype:', req.file.mimetype);
      console.log('[PDF UPLOAD] Uploaded file originalname:', req.file.originalname);
      if (req.file.originalname) {
        const ext = req.file.originalname.split('.').pop();
        console.log('[PDF UPLOAD] Uploaded file extension:', ext);
      }
      // Use Cloudinary URL for file
      const fileUrl = req.file.secure_url || req.file.url || req.file.path;
      console.log('[PDF UPLOAD] Cloudinary fileUrl:', fileUrl);
      const newPdf = new Pdf({
        title,
        fileUrl,
        uploadedBy: req.user.userId,
        uploadedByRole: req.user.role,
        classGroup,
        year,
        semester,
        type: 'subject',
      });
      await newPdf.save();
      res.status(201).json({ message: 'File uploaded successfully', pdf: newPdf });
    } catch (err) {
      console.error('[PDF UPLOAD] ERROR:', err);
      if (err.message) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  }
);

// Edit file meta - Only teachers
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('teacher'),
  async (req, res) => {
    try {
      const pdfId = req.params.id;
      const updateData = req.body;

      const pdf = await Pdf.findById(pdfId);
      if (!pdf) return res.status(404).json({ message: 'PDF not found' });

      // Only allow teachers to edit
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Not authorized to edit' });
      }

      Object.assign(pdf, updateData);
      await pdf.save();

      res.json({ message: 'PDF updated successfully', pdf });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Fetch PDFs by classGroup, year, semester (for download/display)
// This route is already public. No authentication required for GET /api/pdfs
router.get('/', async (req, res) => {
  console.log('[GET /api/pdfs] Request headers:', req.headers);
  const { classGroup, year, semester } = req.query;
  let filter = { deleted: false };
  if (classGroup) filter.classGroup = classGroup;
  if (year) filter.year = year;
  if (semester) filter.semester = semester;
  try {
    const pdfs = await Pdf.find(filter);
    // Only return download info (title, fileUrl, etc.)
    const downloadList = pdfs.map(pdf => ({
      _id: pdf._id,
      title: pdf.title,
      fileUrl: pdf.fileUrl,
      uploadedBy: pdf.uploadedBy,
      uploadedByRole: pdf.uploadedByRole,
      classGroup: pdf.classGroup,
      year: pdf.year,
      semester: pdf.semester,
      type: pdf.type,
      createdAt: pdf.createdAt
    }));
    res.json(downloadList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get deleted PDFs (admin/teacher)
router.get('/deleted', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const deletedPdfs = await Pdf.find({ deleted: true });
    res.json(deletedPdfs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a PDF (soft by default, hard if ?hard=true)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';
    const pdf = await Pdf.findById(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });
    if (hardDelete) {
      await Pdf.deleteOne({ _id: id });
      return res.json({ message: 'PDF permanently deleted' });
    }
    if (pdf.deleted) return res.status(400).json({ message: 'PDF already deleted' });
    pdf.deleted = true;
    pdf.deletedAt = new Date();
    await pdf.save();
    res.json({ message: 'PDF soft deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore a soft-deleted PDF (admin/teacher)
router.post('/:id/restore', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await Pdf.findById(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });
    if (!pdf.deleted) return res.status(400).json({ message: 'PDF is not deleted' });
    pdf.deleted = false;
    pdf.deletedAt = null;
    await pdf.save();
    res.json({ message: 'PDF restored' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// ADMIN: Clean up legacy PDFs missing year/semester or with invalid values
// Usage: POST /api/pdfs/cleanup-legacy (admin only)
router.post('/cleanup-legacy', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  console.log('[CLEANUP-LEGACY] Route hit');
  try {
    // Define allowed years and semesters
    const allowedYears = ['1', '2', '3'];
    const allowedSemesters = ['1', '2'];
    // Find PDFs missing year/semester or with invalid values
    const legacyPdfs = await Pdf.find({
      $or: [
        { year: { $exists: false } },
        { semester: { $exists: false } },
        { year: { $nin: allowedYears } },
        { semester: { $nin: allowedSemesters } }
      ]
    });
    console.log(`[CLEANUP-LEGACY] Found ${legacyPdfs.length} legacy PDFs`);
    let deletedCount = 0;
    for (const pdf of legacyPdfs) {
      if (!pdf.deleted) {
        await Pdf.updateOne(
          { _id: pdf._id },
          { $set: { deleted: true, deletedAt: new Date() } },
          { strict: false }
        );
        deletedCount++;
        console.log(`[CLEANUP-LEGACY] Soft deleted PDF _id=${pdf._id}`);
      }
    }
    console.log(`[CLEANUP-LEGACY] Soft deleted ${deletedCount} PDFs`);
    res.json({ message: 'Legacy PDFs cleaned up', affected: legacyPdfs.length, softDeleted: deletedCount });
  } catch (err) {
    console.error('[PDF CLEANUP LEGACY] ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

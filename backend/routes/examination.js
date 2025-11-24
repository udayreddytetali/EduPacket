const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const parser = require('../upload');
const Pdf = require('../models/Pdf');
const logger = require('../logger');

// Upload examination notification PDF
router.post('/upload', authenticateToken, authorizeRoles('admin', 'teacher', 'cr'), parser.single('file'), async (req, res) => {
  try {
    logger.debug('[UPLOAD] Request body:', req.body);
    logger.debug('[UPLOAD] Request body:', req.body);
    logger.debug('[UPLOAD] Request file:', req.file);
    const { title, link } = req.body;
    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.secure_url || req.file.url || req.file.path;
    }
    if (!fileUrl && !link) {
      logger.error('[UPLOAD] No file or link provided');
      return res.status(400).json({ message: 'Either a file or a link is required.' });
    }
    const newPdf = new Pdf({
      title,
      fileUrl: fileUrl || undefined,
      link: link || undefined,
      uploadedBy: req.user.userId,
      uploadedByRole: req.user.role,
      type: 'examination', // ensure type is set
      classGroup: 'all', // default for notifications
    });
      try {
      await newPdf.save();
      logger.debug('[UPLOAD] Saved document:', newPdf);
      res.status(201).json({ message: 'Examination notification uploaded', pdf: newPdf });
    } catch (saveErr) {
      logger.error('[UPLOAD] Error saving document:', saveErr);
      res.status(500).json({ message: 'Error saving notification', error: saveErr });
    }
  } catch (err) {
    logger.error('[UPLOAD ERROR]', err);
    res.status(500).json({ message: err.message || 'Server error', error: err });
  }
});

// Get all examination notifications
router.get('/', async (req, res) => {
  try {
    logger.debug('[GET /api/examination] Querying for examination notifications...');
  const pdfs = await Pdf.find({ type: 'examination', deleted: false }).sort({ createdAt: -1 });
    if (pdfs.length === 0) {
      logger.debug('[GET /api/examination] No documents found.');
    } else {
      logger.debug('[GET /api/examination] Returned documents:', pdfs);
    }
    res.json(pdfs);
  } catch (err) {
    logger.error('[GET /api/examination] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'Notification not found' });
// Get deleted examination notifications (for Notification Management)
    pdf.deleted = true;
    pdf.deletedAt = new Date();
    await pdf.save();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get deleted examination notifications (for Notification Management)
router.get('/deleted', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const deletedExams = await Pdf.find({ type: 'examination', deleted: true }).sort({ deletedAt: -1 });
    res.json(deletedExams);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download examination notification
router.get('/:id/download', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf || pdf.deleted) return res.status(404).json({ message: 'Notification not found' });
    res.redirect(pdf.fileUrl);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const parser = require('../upload');
const Pdf = require('../models/Pdf');

// Upload jobs notification PDF
router.post('/upload', authenticateToken, authorizeRoles('admin', 'teacher', 'cr'), parser.single('file'), async (req, res) => {
  try {
    const { title, link } = req.body;
    let fileUrl = null;
    if (req.file) {
      fileUrl = req.file.secure_url || req.file.url || req.file.path;
    }
    if (!fileUrl && !link) {
      return res.status(400).json({ message: 'Either a file or a link is required.' });
    }
    const newPdf = new Pdf({
      title,
      fileUrl: fileUrl || undefined,
      link: link || undefined,
      uploadedBy: req.user.userId,
      uploadedByRole: req.user.role,
      type: 'jobs',
    });
    await newPdf.save();
    res.status(201).json({ message: 'Jobs notification uploaded', pdf: newPdf });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get all jobs notifications
router.get('/', async (req, res) => {
  try {
  const pdfs = await Pdf.find({ type: 'jobs', deleted: false }).sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete jobs notification
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: 'Notification not found' });
    pdf.deleted = true;
    pdf.deletedAt = new Date();
    await pdf.save();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download jobs notification
router.get('/:id/download', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf || pdf.deleted) return res.status(404).json({ message: 'Notification not found' });
    res.redirect(pdf.fileUrl);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get deleted jobs notifications (for Notification Management)
router.get('/deleted', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const deletedJobs = await Pdf.find({ type: 'jobs', deleted: true }).sort({ deletedAt: -1 });
    res.json(deletedJobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const Subject = require('../models/subject');
console.log('[ROUTES] subject.js loaded and router initialized');
// Bulk delete all subjects (admin only)
router.delete('/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await Subject.deleteMany({});
    res.json({ message: 'All subjects deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('[SUBJECT BULK DELETE] ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET subjects, optionally filtered by query params, exclude deleted by default
router.get('/', async (req, res) => {
  try {
    const filter = { deleted: false };
    if (req.query.year) filter.year = req.query.year;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.group) filter.group = req.query.group;
    if (req.query.dataType) filter.dataType = req.query.dataType;
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// GET deleted subjects (admin/teacher)
router.get('/deleted', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const deletedSubjects = await Subject.find({ deleted: true });
    res.json(deletedSubjects);
  } catch (error) {
    console.error('Error fetching deleted subjects:', error);
    res.status(500).json({ message: 'Error fetching deleted subjects' });
  }
});

// Add a new subject (teachers only)
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher', 'cr'), async (req, res) => {
  try {
    // Debug log for troubleshooting
    console.log('Authorization header:', req.headers['authorization']);
    console.log('Decoded req.user:', req.user);
    const { name, year, semester, group, dataType, files } = req.body;

    if (!name || !year || !semester || !group || !dataType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for duplicate subject
    const existing = await Subject.findOne({
      name,
      year,
      semester,
      group,
      dataType,
      deleted: false
    });
    if (existing) {
      return res.status(409).json({ message: 'Subject with this name already exists for the selected group and type.' });
    }

    const newSubject = new Subject({
      name,
      year,
      semester,
      group,
      dataType,
      files: files || [],
    });

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ message: 'Error adding subject' });
  }
});

// Soft delete a subject by ID (teachers only)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    console.log('[DELETE SUBJECT] req.user:', req.user);
    console.log('[DELETE SUBJECT] req.params.id:', req.params.id);
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.deleted) return res.status(400).json({ message: 'Subject already deleted' });
    subject.deleted = true;
    subject.deletedAt = new Date();
    await subject.save();
    res.json({ message: 'Subject soft deleted' });
  } catch (error) {
    console.error('Error soft deleting subject:', error);
    res.status(500).json({ message: 'Error soft deleting subject' });
  }
});

// Restore a soft-deleted subject (admin/teacher)
router.post('/:id/restore', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (!subject.deleted) return res.status(400).json({ message: 'Subject is not deleted' });
    subject.deleted = false;
    subject.deletedAt = null;
    await subject.save();
    res.json({ message: 'Subject restored' });
  } catch (error) {
    console.error('Error restoring subject:', error);
    res.status(500).json({ message: 'Error restoring subject' });
  }
});

module.exports = router;

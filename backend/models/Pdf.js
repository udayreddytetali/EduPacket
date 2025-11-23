const mongoose = require('mongoose');


const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: function() { return this.type === 'subject'; } },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByRole: { type: String, enum: ['admin', 'teacher', 'cr'], required: true },
  classGroup: { type: String, required: true },
  year: { type: String, required: function() { return this.type === 'subject'; } },
  semester: { type: String, required: function() { return this.type === 'subject'; } },
  type: { type: String, required: true }, // Added for notifications/subjects
  link: { type: String }, // Optional link for notifications
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Pdf', pdfSchema);

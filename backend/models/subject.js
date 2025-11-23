const mongoose = require('mongoose');


const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  group: { type: String, required: true },
  dataType: { type: String, required: true },  // e.g., "model paper", "pdfs"
  files: [{ type: String }],                    // Array of file names or URLs
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Subject', subjectSchema);

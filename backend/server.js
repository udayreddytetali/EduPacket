require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Global request logger for debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
// Read allowed frontend origin from env so production can set the Vercel URL.
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://edu-packet.vercel.app';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json()); // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const pdfRoutes = require('./routes/pdfs');
const subjectRoutes = require('./routes/subject');
const examinationRoutes = require('./routes/examination');
const circularsRoutes = require('./routes/circulars');
const jobsRoutes = require('./routes/jobs');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pdfs', pdfRoutes);
console.log('[SERVER] Mounting /api/subjects route');
app.use('/api/subjects', subjectRoutes);
app.use('/api/examination', examinationRoutes);
app.use('/api/circulars', circularsRoutes);
app.use('/api/jobs', jobsRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Backend server is running');
});


// Error Handling Middleware (Optional but Recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server on port 5000 (or env PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

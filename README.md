# Edupacket

EduPacket is a student-focused resource portal that hosts model papers, notes, circulars, and job/exam notifications. This repository contains a React frontend and a Node.js + Express backend with MongoDB for data storage.

Live demo (example page): https://edu-packet.vercel.app/1st-Year/1st-Sem

Overview
- Frontend: React (Create React App), React Router, Context API, Axios
- Backend: Node.js, Express, Mongoose (MongoDB), JWT authentication, bcrypt for password hashing
- File storage: Cloudinary (used for PDFs and file hosting via backend upload)
- Database: MongoDB Atlas
- Deployment: Frontend on Vercel, Backend on Render (recommended)

Why it helps students
- Centralized access to previous years' model papers and notes.
- Role-based uploads and management (admin, teacher, class representative).
- Quick access to circulars, exam notices, and job postings.

Quick start
1. Backend

```powershell
cd backend
npm install
# Create .env with required variables (MONGODB_URI, JWT_SECRET, CLOUDINARY_* etc.)
node server.js
```

2. Frontend

```powershell
cd frontend
npm install
npm start
```

Deployment notes
- Set environment variables on the host (Render for backend, Vercel for frontend). The frontend must have `REACT_APP_API_URL` set to your backend base URL at build-time.

If you want, I can help update the project README with screenshots, architecture diagrams, or step-by-step deployment instructions to Vercel/Render.

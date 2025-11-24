# edupacket — Frontend

Live demo: https://edu-packet.vercel.app/1st-Year/1st-Sem

This is the frontend for the `edupacket` project — a lightweight student resource portal that hosts model papers, notes, circulars, and job/exam notifications.

Technologies used (frontend):
- React (Create React App)
- React Router for client routing
- Context API for auth state management
- Axios for API requests
- CSS modules and component-level styles

How the frontend is useful to students:
- Browse subjects by year/semester and download model papers and notes.
- Teachers, admins and class representatives can upload and manage PDFs.
- Notifications, circulars and job posts are surfaced in the footer area for quick access.

Local development

1. Install dependencies:

```powershell
cd frontend
npm install
```

2. Run dev server:

```powershell
npm start
```

3. Build for production:

```powershell
npm run build
```

Deployment notes
- The frontend is intended to be deployed to Vercel (or another static host). Set `REACT_APP_API_URL` in your Vercel project to the backend URL (for example `https://edupacket-backend.onrender.com`) and redeploy so the built app points to the correct API.

If you'd like, update this file with any additional frontend-specific instructions or screenshots.
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

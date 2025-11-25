import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/Authcontext';
import NotificationDetail from './NotificationDetail';

const PAGE_SIZE = 10;

function NotificationList({ category }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  // Check if user is admin
  const isAdmin = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch {
      return false;
    }
  })();
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || (window && window.REACT_APP_API_URL) || '';
        const res = await fetch(`${API_BASE}/api/${category}`);
        if (res.status === 401) {
          logout();
          return;
        }
        const data = await res.json();
        if (data && typeof data.message === 'string' && data.message.toLowerCase().includes('jwt expired')) {
          logout();
          return;
        }
        // Sort notifications by createdAt descending (most recent first)
        if (Array.isArray(data)) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setNotifications(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      } catch (err) {
        setNotifications([]);
      }
    }
    fetchNotifications();
  }, [category, showAddForm]);

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const paginated = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Heading for single-category pages
  const showHeading = category !== undefined;
  const headingLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  // Add notification handler
  const handleAddNotification = async (e) => {
    e.preventDefault();
    if (!newTitle || (!newFile && !newLink)) {
      alert('Please provide either a link or a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      if (newFile) formData.append('file', newFile);
      if (newLink) formData.append('link', newLink);
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_BASE}/api/${category}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewTitle('');
        setNewFile(null);
        setNewLink('');
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    }
    setLoading(false);
  };

  // Determine main dashboard path based on user role
  const getMainPath = () => {
    if (user && user.role === 'admin') return '/admin/1st-Year/1st-Sem';
    if (user && user.role === 'teacher') return '/teacher/1st-Year/1st-Sem';
    if (user && user.role === 'cr') return '/cr/1st-Year/1st-Sem';
    return '/1st-Year/1st-Sem';
  };

  return (
    <div style={{ width: '100%', margin: '0 auto', padding: '0 8px', boxSizing: 'border-box', overflowX: 'auto' }}>
      {showHeading && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{headingLabel}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            {isAdmin && (
              <button onClick={() => setShowAddForm((v) => !v)} style={{ padding: '6px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add</button>
            )}
          </div>
        </div>
      )}
  {isAdmin && showAddForm && (
    <form onSubmit={handleAddNotification} style={{ marginBottom: 16, background: '#f7f7f7', padding: 16, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
      <input type="text" placeholder="Notification Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required />
      <input type="url" placeholder="Link (https://...)" value={newLink} onChange={e => setNewLink(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      <input type="file" accept="application/pdf" onChange={e => setNewFile(e.target.files[0])} style={{ flex: 1 }} />
      <button type="submit" disabled={loading} style={{ padding: '8px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Uploading...' : 'Upload'}</button>
    </form>
  )}
      {paginated.map((n) => (
        <NotificationDetail key={n._id || n.id} notification={n} category={category} />
      ))}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: currentPage === 1 ? '#eee' : '#1976d2',
            color: currentPage === 1 ? '#888' : '#fff',
            fontWeight: 600,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
        >Prev</button>
        <span style={{ fontWeight: 500, fontSize: 15 }}>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: currentPage === totalPages ? '#eee' : '#1976d2',
            color: currentPage === totalPages ? '#888' : '#fff',
            fontWeight: 600,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
        >Next</button>
      </div>
    </div>
  );
}

export default NotificationList;

import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import './mobile-fixes.css';
import { AuthContext } from '../../contexts/Authcontext';


function NotificationManagement() {
  const { token, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeletedNotifications();
  }, []);

  // Fetch only deleted notifications from all three endpoints
  const fetchDeletedNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const [examinationRes, circularsRes, jobsRes] = await Promise.all([
        axios.get('/api/examination/deleted', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/circulars/deleted', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/jobs/deleted', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      // Combine and sort all deleted notifications
      const allDeleted = [
        ...examinationRes.data,
        ...circularsRes.data,
        ...jobsRes.data
      ];
      const sorted = allDeleted.sort((a, b) => new Date(b.deletedAt || b.createdAt) - new Date(a.deletedAt || a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      if (err.response && (err.response.status === 401 || (err.response.data && err.response.data.message && err.response.data.message.toLowerCase().includes('jwt expired')))) {
        logout();
      } else {
        setError('Failed to fetch deleted notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="restore-deleted-container" style={{ marginTop: 40, width: '100%', overflowX: 'auto', padding: '0 8px', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'center', color: '#205761', fontWeight: 700, letterSpacing: 1 }}>Notifications Management</h2>
      {loading && <p style={{ textAlign: 'center', color: '#205761' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
  <table className="restore-deleted-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(32,87,97,0.07)' }}>
        <thead>
          <tr style={{ background: '#ffe3e3' }}>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Title</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Type</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Deleted By</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Deleted At</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(n => (
            <tr key={n._id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{n.title}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{n.type || n.category || 'Unknown'}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{n.uploadedByName || n.uploadedByRole}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</td>
              <td style={{ textAlign: 'center', padding: '10px 0' }}>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await axios.post(`/api/${n.type}/${n._id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
                      setNotifications(notifications.filter(notif => notif._id !== n._id));
                    } catch (err) {
                      setError('Failed to restore notification');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{ background: '#e3fbe3', color: '#205761', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}
                >Restore</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
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
        <span style={{ fontWeight: 500, fontSize: 15 }}>Page {currentPage} of {Math.ceil(notifications.length / PAGE_SIZE)}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(Math.ceil(notifications.length / PAGE_SIZE), p + 1))}
          disabled={currentPage === Math.ceil(notifications.length / PAGE_SIZE)}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: currentPage === Math.ceil(notifications.length / PAGE_SIZE) ? '#eee' : '#1976d2',
            color: currentPage === Math.ceil(notifications.length / PAGE_SIZE) ? '#888' : '#fff',
            fontWeight: 600,
            cursor: currentPage === Math.ceil(notifications.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
        >Next</button>
      </div>
    </div>
  );
}

export default NotificationManagement;

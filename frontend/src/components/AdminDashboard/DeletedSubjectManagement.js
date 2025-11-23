import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import './mobile-fixes.css';
import { AuthContext } from '../../contexts/Authcontext';

function DeletedSubjectManagement() {
  const { token, logout } = useContext(AuthContext);
  const [deletedSubjects, setDeletedSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeletedSubjects();
  }, []);

  const fetchDeletedSubjects = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/subjects/deleted', { headers: { Authorization: `Bearer ${token}` } })
      .then(resp => {
        // Sort by most recently deleted first
        const sorted = Array.isArray(resp.data)
          ? resp.data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
          : [];
        setDeletedSubjects(sorted);
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || (err.response.data && err.response.data.message && err.response.data.message.toLowerCase().includes('jwt expired')))) {
          logout();
        } else {
          setError('Failed to fetch deleted subjects');
        }
      })
      .finally(() => setLoading(false));
  };

  const handleRestore = (id) => {
    setLoading(true);
    setError(null);
    axios.post(`/api/subjects/${id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setDeletedSubjects(deletedSubjects.filter(s => s._id !== id)))
      .catch(err => {
        if (err.response && (err.response.status === 401 || (err.response.data && err.response.data.message && err.response.data.message.toLowerCase().includes('jwt expired')))) {
          logout();
        } else {
          setError('Failed to restore subject');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
  <div className="deleted-subject-container">
      <h2 style={{ textAlign: 'center', color: '#205761', fontWeight: 700, letterSpacing: 1 }}>Deleted Subjects</h2>
      {loading && <p style={{ textAlign: 'center', color: '#205761' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
  <table className="deleted-subject-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(32,87,97,0.07)' }}>
        <thead>
          <tr style={{ background: '#ffe3e3' }}>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Name</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Year</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Semester</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Group</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Type</th>
            {/* Deleted By column removed */}
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Deleted At</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deletedSubjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(s => (
            <tr key={s._id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.name}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.year}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.semester}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.group}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.dataType}</td>
              {/* Deleted By cell removed */}
              <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{s.deletedAt ? new Date(s.deletedAt).toLocaleDateString() : ''}</td>
              <td style={{ textAlign: 'center', padding: '10px 0' }}>
                <button onClick={() => handleRestore(s._id)} style={{ background: '#e3fbe3', color: '#205761', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Restore</button>
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
        <span style={{ fontWeight: 500, fontSize: 15 }}>Page {currentPage} of {Math.ceil(deletedSubjects.length / PAGE_SIZE)}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(Math.ceil(deletedSubjects.length / PAGE_SIZE), p + 1))}
          disabled={currentPage === Math.ceil(deletedSubjects.length / PAGE_SIZE)}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: currentPage === Math.ceil(deletedSubjects.length / PAGE_SIZE) ? '#eee' : '#1976d2',
            color: currentPage === Math.ceil(deletedSubjects.length / PAGE_SIZE) ? '#888' : '#fff',
            fontWeight: 600,
            cursor: currentPage === Math.ceil(deletedSubjects.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
        >Next</button>
      </div>
    </div>
  );
}

export default DeletedSubjectManagement;

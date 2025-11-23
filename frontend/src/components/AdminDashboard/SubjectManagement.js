import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/Authcontext';


function SubjectManagement({ showOnlyDeleted, year, semester, group, dataType, role }) {
  const { token, user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [deletedSubjects, setDeletedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFields, setEditFields] = useState({});
  const [addFields, setAddFields] = useState({ name: '', year: '', semester: '', group: '', dataType: '', files: [] });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    // Build query params for filtering
    const params = {};
    if (year) params.year = year;
    if (semester) params.semester = semester;
    if (group) params.group = group;
    if (dataType) params.dataType = dataType;
    axios.get('/api/subjects', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(resp => setSubjects(resp.data))
      .catch(() => setError('Failed to fetch subjects'))
      .finally(() => setLoading(false));
  }, [token, year, semester, group, dataType]);

  const fetchDeleted = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/subjects/deleted', { headers: { Authorization: `Bearer ${token}` } })
      .then(resp => setDeletedSubjects(resp.data))
      .catch(() => setError('Failed to fetch deleted subjects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (showOnlyDeleted) fetchDeleted();
  }, [showOnlyDeleted]);

  const handleRestore = (id) => {
    setLoading(true);
    setError(null);
    axios.post(`/api/subjects/${id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setDeletedSubjects(deletedSubjects.filter(s => s._id !== id)))
      .catch(() => setError('Failed to restore subject'))
      .finally(() => setLoading(false));
  };

  // --- Add Subject ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFields((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSubject = (e) => {
    e.preventDefault();
    // Frontend validation for required fields
    const requiredFields = ['name', 'year', 'semester', 'group', 'dataType'];
    for (const field of requiredFields) {
      if (!addFields[field] || addFields[field].trim() === '') {
        setError(`Please fill out the ${field} field.`);
        return;
      }
    }
    setLoading(true);
    setError(null);
    axios.post('/api/subjects', addFields, { headers: { Authorization: `Bearer ${token}` } })
      .then((resp) => {
        setSubjects((prev) => [...prev, resp.data]);
        setAddFields({ name: '', year: '', semester: '', group: '', dataType: '', files: [] });
        setAdding(false);
      })
      .catch(() => setError('Failed to add subject'))
      .finally(() => setLoading(false));
  };

  // --- Edit Subject ---
  const handleEdit = (subject) => {
    setEditId(subject._id);
    setEditFields({ ...subject });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = () => {
    setLoading(true);
    setError(null);
    axios.put(`/api/subjects/${editId}`, editFields, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setSubjects(subjects.map(s => s._id === editId ? { ...s, ...editFields } : s));
        setEditId(null);
        setEditFields({});
      })
      .catch(() => setError('Failed to edit subject'))
      .finally(() => setLoading(false));
  };

  // --- Delete Subject ---
  const handleDelete = (id) => {
    setLoading(true);
    setError(null);
    axios.delete(`/api/subjects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setSubjects(subjects.filter(s => s._id !== id)))
      .catch(() => setError('Failed to delete subject'))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ textAlign: 'center', color: '#205761', fontWeight: 700, letterSpacing: 1 }}>Subjects Management</h2>
      {loading && <p style={{ textAlign: 'center', color: '#205761' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!showOnlyDeleted && user && (user.role === 'admin' || user.role === 'teacher') && (
        <>
          {!adding ? (
            <button onClick={() => setAdding(true)} style={{ marginBottom: 16, background: '#205761', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Add Subject</button>
          ) : (
            <form onSubmit={handleAddSubject} style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <input name="name" value={addFields.name} onChange={handleAddChange} placeholder="Name" required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="year" value={addFields.year} onChange={handleAddChange} placeholder="Year" required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="semester" value={addFields.semester} onChange={handleAddChange} placeholder="Semester" required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="group" value={addFields.group} onChange={handleAddChange} placeholder="Group" required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="dataType" value={addFields.dataType} onChange={handleAddChange} placeholder="Type" required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
              <button type="submit" style={{ background: '#7ed957', color: '#205761', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => setAdding(false)} style={{ background: '#ffe3e3', color: '#b00020', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </form>
          )}
        </>
      )}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(32,87,97,0.07)' }}>
        <thead>
          <tr style={{ background: '#ffe3e3' }}>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Name</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Year</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Semester</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Group</th>
            <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Type</th>
            {!showOnlyDeleted && (user?.role === 'admin' || user?.role === 'teacher') && <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Actions</th>}
            {showOnlyDeleted && <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Deleted At</th>}
            {showOnlyDeleted && <th style={{ padding: '12px 0', textAlign: 'center', fontWeight: 600, color: '#b00020', fontSize: 16 }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {showOnlyDeleted
            ? deletedSubjects.map(subject => (
                <tr key={subject._id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.name}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.year}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.semester}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.group}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.dataType}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.deletedAt ? new Date(subject.deletedAt).toLocaleDateString() : ''}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0' }}>
                    <button onClick={() => handleRestore(subject._id)} style={{ background: '#e3fbe3', color: '#205761', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Restore</button>
                  </td>
                </tr>
              ))
            : subjects.map(subject => (
                <tr key={subject._id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
                  {editId === subject._id ? (
                    <>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}><input name="name" value={editFields.name} onChange={handleEditChange} style={{ fontSize: 15, padding: 4 }} /></td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}><input name="year" value={editFields.year} onChange={handleEditChange} style={{ fontSize: 15, padding: 4 }} /></td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}><input name="semester" value={editFields.semester} onChange={handleEditChange} style={{ fontSize: 15, padding: 4 }} /></td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}><input name="group" value={editFields.group} onChange={handleEditChange} style={{ fontSize: 15, padding: 4 }} /></td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}><input name="dataType" value={editFields.dataType} onChange={handleEditChange} style={{ fontSize: 15, padding: 4 }} /></td>
                      <td style={{ textAlign: 'center', padding: '10px 0' }}>
                        <button onClick={handleEditSave} style={{ background: '#7ed957', color: '#205761', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, marginRight: 6, cursor: 'pointer' }}>Save</button>
                        <button onClick={() => { setEditId(null); setEditFields({}); }} style={{ background: '#ffe3e3', color: '#b00020', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.name}</td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.year}</td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.semester}</td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.group}</td>
                      <td style={{ textAlign: 'center', padding: '10px 0', fontSize: 15 }}>{subject.dataType}</td>
                      <td style={{ textAlign: 'center', padding: '10px 0' }}>
                        <button onClick={() => handleEdit(subject)} style={{ background: '#e3fbe3', color: '#205761', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, marginRight: 6, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(subject._id)} style={{ background: '#ffe3e3', color: '#b00020', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectManagement;

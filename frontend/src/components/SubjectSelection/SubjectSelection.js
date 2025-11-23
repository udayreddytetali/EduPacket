import axios from 'axios';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/Authcontext';
import './SubjectSelection.css';
console.log('[SubjectSelection.js] Loaded');
// Only keep the final export default at the end

const SubjectSelection = ({ group, dataType, year, semester }) => {
  // Remove subject UI state
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [removeSubjectName, setRemoveSubjectName] = useState('');
  const [deletedSubjects, setDeletedSubjects] = useState([]);
  // Remove subject handler (with restore logic)
  const handleRemoveSubjectConfirm = async (e) => {
    e.preventDefault();
    setSubjectError(null);
    console.log('[Remove Subject] Stage 1: Form submitted');
    if (!removeSubjectName) {
      console.log('[Remove Subject] Stage 2: No subject selected');
      return;
    }
    setLoading(true);
    try {
      // Always fetch latest subjects before attempting removal
      const res = await axios.get('/api/subjects', {
        params: { group, dataType: normalizedDataType, year, semester },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
  // Find subject by name (case-insensitive)
  const subjectObj = res.data.find(s => s.name.trim().toLowerCase() === removeSubjectName.trim().toLowerCase());
      if (!subjectObj || !subjectObj._id) {
        setSubjectError('Subject not found. Please refresh and try again.');
        setLoading(false);
        return;
      }
      await axios.delete(`/api/subjects/${subjectObj._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Re-fetch subjects after removal
      const updatedRes = await axios.get('/api/subjects', {
        params: { group, dataType: normalizedDataType, year, semester },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const names = updatedRes.data.map(s => s.name);
      const uniqueNames = Array.from(new Set(names.map(n => n.trim().toLowerCase())));
      setSubjects(uniqueNames);
      setDeletedSubjects(prev => [...prev, removeSubjectName]);
      setShowRemoveForm(false);
      setRemoveSubjectName('');
      if (expandedSubject === removeSubjectName) setExpandedSubject(null);
    } catch (err) {
      setSubjectError('Failed to remove subject: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  // Restore subject handler (dummy, needs backend logic)
  const handleRestoreSubject = async (subject) => {
    // TODO: Implement backend restore logic
    setSubjects(prev => [...prev, subject]);
    setDeletedSubjects(prev => prev.filter(s => s !== subject));
  };
  const { user, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  // Add missing state variables
  const [loading, setLoading] = useState(false);
  const [subjectError, setSubjectError] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
// Removed duplicate export statements
  const canAdd = user && (user.role === 'admin' || user.role === 'teacher' || user.role === 'cr');
  const canRemove = user && (user.role === 'admin' || user.role === 'teacher');
  // Normalize the dataType for lookup (handle hyphens, plurals, etc.)
  let normalizedDataType = dataType ? dataType.trim().toLowerCase() : '';
  if (normalizedDataType === 'model paper' || normalizedDataType === 'model papers') {
    normalizedDataType = 'model-papers';
  }

  useEffect(() => {
    console.log('[SubjectSelection] useEffect', { group, normalizedDataType, year, semester, token });
    if (group && normalizedDataType && year && semester) {
      setLoading(true);
      axios.get('/api/subjects', {
        params: { group, dataType: normalizedDataType, year, semester },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      })
        .then(res => {
          // Store subjects as array of { name, _id }
          const subjectObjs = res.data.map(s => ({ name: s.name, _id: s._id }));
          console.log('[SubjectSelection] Subjects fetched:', subjectObjs);
          setSubjects(subjectObjs);
          setLoading(false);
        })
        .catch(err => {
          console.error('[SubjectSelection] Error fetching subjects:', err);
          setSubjects([]);
          setLoading(false);
        });
    } else {
      setSubjects([]);
    }
  }, [group, normalizedDataType, year, semester, token]);

  // ...existing code...
  const toggleExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  // Add subject handler (with file upload)
  const handleAddSubject = async (e) => {
    e.preventDefault();
    setSubjectError(null);
    console.log('[DEBUG] User:', user);
    console.log('[DEBUG] Token:', token);
    console.log('[DEBUG] newSubject:', newSubject);
    console.log('[DEBUG] newFile:', newFile);
    console.log('[DEBUG] group:', group, 'normalizedDataType:', normalizedDataType);
    if (!newSubject.trim()) {
      setSubjectError('Subject name required');
      return;
    }
    if (!newFile) {
      setSubjectError('Please select a file');
      return;
    }
    setLoading(true);
    try {
      // Add subject first
      setSubjectError(null);
      setLoading(true);
      setUploading(true);
      console.log('[Add Subject] Sending:', { name: newSubject.trim(), year, semester, group, dataType: normalizedDataType });
      const subjectRes = await axios.post('/api/subjects', {
        name: newSubject.trim(),
        year,
        semester,
        group,
        dataType: normalizedDataType
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      console.log('[Add Subject] Success:', subjectRes.data);
      // Upload file for subject
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('title', newFile.name);
      formData.append('classGroup', newSubject.trim());
      formData.append('year', year);
      formData.append('semester', semester);
      console.log('[File Upload] Sending:', { file: newFile.name, classGroup: newSubject.trim(), year, semester, token });
      try {
        const fileRes = await axios.post('/api/pdfs/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
        console.log('[File Upload] Success:', fileRes.data);
      } catch (fileErr) {
        console.error('[File Upload] Failed:', fileErr);
        if (fileErr.response) {
          console.error('[File Upload] Response:', fileErr.response.data);
        }
        setSubjectError('File upload failed: ' + (fileErr.response?.data?.message || fileErr.message));
        setUploading(false);
        setLoading(false);
        return;
      }
      // Re-fetch subjects from backend for dynamic update
      try {
        const res = await axios.get('/api/subjects', {
          params: { group, dataType: normalizedDataType, year, semester },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        const subjectObjs = res.data.map(s => ({ name: s.name, _id: s._id }));
        setSubjects(subjectObjs);
      } catch (fetchErr) {
        console.error('[Fetch Subjects] Failed:', fetchErr);
      }
      // Also refresh files for the new subject
      if (expandedSubject === newSubject.trim()) setExpandedSubject(null);
      setNewSubject('');
      setNewFile(null);
      setShowAddForm(false);
      setUploading(false);
    } catch (err) {
      console.error('[Add Subject] Failed:', err);
      setSubjectError('Failed to add subject: ' + (err.response?.data?.message || err.message));
    }
  setLoading(false);
  setUploading(false);
  };

  // Uploading state for UI
  const [uploading, setUploading] = useState(false);
  // Remove subject handler
  // handleRemoveSubject was unused and removed to clean up ESLint warning

  return (
    <div className="subject-selection-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Subjects</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {canAdd && group && normalizedDataType && (
            <button
              onClick={() => setShowAddForm(true)}
              className="add-subject-btn"
              style={{ fontSize: 15, background: '#205761', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add Subject
            </button>
          )}
          {canRemove && group && normalizedDataType && subjects.length > 0 && (
            <button
              onClick={() => setShowRemoveForm(true)}
              className="remove-subject-btn"
              style={{ fontSize: 15, background: '#b00020', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Remove Subject
            </button>
          )}
        </div>
      </div>
      {canRemove && group && normalizedDataType && showRemoveForm && (
        <form onSubmit={handleRemoveSubjectConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, background: '#fff0f0', padding: 16, borderRadius: 8, border: '1px solid #b00020' }}>
          <label style={{ fontWeight: 500, color: '#b00020' }}>Select Subject to Remove:</label>
          <select value={removeSubjectName} onChange={e => setRemoveSubjectName(e.target.value)} style={{ fontSize: 15, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}>
            <option value="">-- Select Subject --</option>
            {subjects.map((subjectObj, idx) => (
              <option key={subjectObj._id || subjectObj.name + '-' + idx} value={subjectObj.name}>{subjectObj.name}</option>
            ))}
          </select>
          {removeSubjectName && (
            <div style={{ color: '#b00020', fontSize: 14, fontWeight: 600 }}>
              Warning: This will delete the subject and move it to the restore section. Are you sure?
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={!removeSubjectName || loading} style={{ fontSize: 15, background: '#b00020', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
              Delete
            </button>
            <button type="button" onClick={() => { setShowRemoveForm(false); setRemoveSubjectName(''); setSubjectError(null); }} style={{ fontSize: 15, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
          {subjectError && <div style={{ color: '#b00020', fontSize: 14 }}>{subjectError}</div>}
        </form>
      )}
      {canAdd && group && normalizedDataType && showAddForm && (
        <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, background: '#f7f7f7', padding: 16, borderRadius: 8 }}>
          {uploading && <div style={{ color: '#205761', fontWeight: 600, marginBottom: 8 }}>Uploading...</div>}
          <label style={{ fontWeight: 500 }}>Subject Name:</label>
          <input
            type="text"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="Enter subject name"
            style={{ fontSize: 15, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <label style={{ fontWeight: 500 }}>Upload PDF/Model Paper:</label>
          <input
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            onChange={e => setNewFile(e.target.files[0])}
            style={{ fontSize: 15 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ fontSize: 15, background: '#205761', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
              Submit
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); setNewSubject(''); setNewFile(null); setSubjectError(null); }} style={{ fontSize: 15, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
          {subjectError && <div style={{ color: 'red', fontSize: 14 }}>{subjectError}</div>}
        </form>
      )}
      {subjects.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#888', width: '100%' }}>
            Select a group and data type to see subjects
          </p>
        </div>
      ) : (
        <ul className="subject-list">
          {subjects.map((subjectObj, idx) => {
            const subject = subjectObj.name;
            return (
              <li key={subject + '-' + idx}>
                <div
                  className="subject-header"
                  onClick={() => toggleExpand(subject)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') toggleExpand(subject);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {subject}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
                    <span
                      className={`arrow ${expandedSubject === subject ? 'expanded' : ''}`}
                      style={{ marginLeft: 10, touchAction: 'manipulation' }}
                    >
                      ▶
                    </span>
                  </span>
                </div>
                {expandedSubject === subject && (
                  <SubjectFiles
                    subject={subject}
                    group={group}
                    dataType={normalizedDataType}
                    user={user}
                    token={token}
                    year={year}
                    semester={semester}
                    key={`files-${subject}-${year}-${semester}`}
                  />
                )}
              </li>
            );
          })}
      {/* Restore deleted subjects section */}
      {deletedSubjects.length > 0 && (
        <div style={{ marginTop: 24, background: '#f7f7f7', padding: 16, borderRadius: 8, border: '1px solid #ccc' }}>
          <h4 style={{ margin: 0, color: '#205761' }}>Restore Subjects</h4>
          <ul style={{ marginTop: 8 }}>
            {deletedSubjects.map(s => (
              <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{s}</span>
                <button
                  onClick={() => handleRestoreSubject(s)}
                  style={{ fontSize: 14, background: '#205761', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
        </ul>
      )}
    </div>
  );
}
// SubjectFiles component
function SubjectFiles({ subject, group, dataType, user, token, year, semester }) {
  console.log('[SubjectFiles] Rendered with:', { subject, group, dataType, year, semester, token });
  if (!subject || !year || !semester) {
    console.warn('[SubjectFiles] Not rendering/fetching because missing prop:', { subject, year, semester });
  }
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newFile, setNewFile] = useState(null);

  const fetchFiles = useCallback(() => {
    if (!subject || !year || !semester) {
      setFiles([]);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = { classGroup: subject, year, semester };
    axios.get('/api/pdfs', {
      params,
      headers
    })
      .then(res => {
        setFiles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setFiles([]);
        setLoading(false);
        setError('No files found for this subject yet.');
      });
  }, [subject, year, semester, token]);
  useEffect(() => {
    fetchFiles();
  }, [subject, year, semester, token, fetchFiles]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    console.log('[File Upload] User:', user);
    console.log('[File Upload] Token:', token);
    if (!newFile) return setError('Please select a file');
    if (newFile.type.startsWith('video/')) {
      setError('Video files are not allowed.');
      return;
    }
    const formData = new FormData();
  formData.append('file', newFile);
  formData.append('title', newFile.name);
  formData.append('classGroup', subject);
  formData.append('year', year);
  formData.append('semester', semester);
    setLoading(true);
    try {
      await axios.post('/api/pdfs/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setSuccess('File uploaded!');
      setNewFile(null);
      // Immediately refresh files after upload
      fetchFiles();
    } catch (err) {
      setError('Upload failed.');
    }
    setLoading(false);
  };

  // Remove file handler
  const handleRemoveFile = async (fileId) => {
    setError(null);
    try {
      await axios.delete(`/api/pdfs/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setFiles(prev => prev.filter(f => f._id !== fileId));
    } catch (err) {
      setError('Failed to remove file.');
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      {user && ['admin', 'teacher', 'cr'].includes(user.role) && (
        <form onSubmit={handleUpload} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="file"
            name={`file-upload-${subject}`}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            style={{ fontSize: 14 }}
            onChange={e => setNewFile(e.target.files[0])}
          />
          <button type="submit" style={{ fontSize: 14, padding: '4px 12px', background: '#205761', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Upload
          </button>
        </form>
      )}
      {loading && <div style={{ color: '#888', fontSize: 14 }}>Loading...</div>}
      {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ color: 'green', fontSize: 14 }}>{success}</div>}
      <ul className="file-list">
        {files.length === 0 && !loading && <li style={{ color: '#888', fontSize: 14 }}>No files uploaded yet.</li>}
        {files.map(file => (
          <li key={file._id || file.fileUrl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>{file.title}</span>
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download={file.title.endsWith('.pdf')} style={{ marginLeft: 8, fontSize: 14 }}>
              Download
            </a>
            {user && ['admin', 'teacher', 'cr'].includes(user.role) && (
              <button
                onClick={() => handleRemoveFile(file._id)}
                title="Remove File"
                style={{ background: '#ffe3e3', color: '#b00020', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: 14, fontWeight: 700, marginLeft: 8, cursor: 'pointer' }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    {/* Preview removed, only download button shown */}
  </div>
  );
}
export default SubjectSelection;

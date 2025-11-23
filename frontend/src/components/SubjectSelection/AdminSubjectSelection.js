// AdminSubjectSelection.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/Authcontext';
import './SubjectSelection.css';

// Reuse the same data structure for demo; in real app, fetch from backend


const AdminSubjectSelection = ({ group, dataType }) => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);

  let normalizedDataType = dataType ? dataType.trim().toLowerCase() : '';
  if (normalizedDataType === 'model paper' || normalizedDataType === 'model papers') {
    normalizedDataType = 'model-papers';
  }

  useEffect(() => {
    // Fetch subjects from backend based on group and dataType
    if (!group || !normalizedDataType) {
      setSubjects([]);
      setExpandedSubject(null);
      return;
    }
    const fetchSubjects = async () => {
      try {
        // Adjust API endpoint and params as per your backend
        const params = { group, dataType: normalizedDataType };
        const response = await fetch(`/api/subjects?group=${encodeURIComponent(group)}&dataType=${encodeURIComponent(normalizedDataType)}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        // Expecting data to be an array of subject names
        setSubjects(Array.isArray(data) ? data : []);
        setExpandedSubject(null);
      } catch (err) {
        setSubjects([]);
        setExpandedSubject(null);
      }
    };
    fetchSubjects();
  }, [group, normalizedDataType]);

  const toggleExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  // Admin controls
  const handleAddSubject = () => {
    // Implement add subject logic (show modal/form, call backend, etc.)
    alert('Add Subject (admin only)');
  };
  const handleEditSubject = (subject) => {
    alert(`Edit Subject: ${subject} (admin only)`);
  };
  const handleDeleteSubject = (subject) => {
    alert(`Delete Subject: ${subject} (admin only)`);
  };

  return (
    <div className="subject-selection-container">
      <h3>Subjects {user && (user.role === 'admin' || user.role === 'teacher') && (
        <button onClick={handleAddSubject} style={{ marginLeft: 12, fontSize: 14 }}>+ Add Subject</button>
      )}</h3>
      {subjects.length === 0 ? (
        <p>Select a group and data type to see subjects</p>
      ) : (
        <ul className="subject-list">
          {subjects.map((subject) => (
            <li key={subject}>
              <div
                className="subject-header"
                onClick={() => toggleExpand(subject)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && toggleExpand(subject)}
              >
                {subject}
                <span className={`arrow ${expandedSubject === subject ? 'expanded' : ''}`}>▶</span>
                {user && (user.role === 'admin' || user.role === 'teacher') && (
                  <>
                    <button onClick={() => handleEditSubject(subject)} style={{ marginLeft: 8, fontSize: 13 }}>Edit</button>
                    <button onClick={() => handleDeleteSubject(subject)} style={{ marginLeft: 4, fontSize: 13, color: 'red' }}>Delete</button>
                  </>
                )}
              </div>
              {expandedSubject === subject && (
                <ul className="file-list">
                  {/* TODO: Replace with backend files for this subject */}
                  <li style={{ color: '#888', fontSize: 14 }}>
                    (Files for this subject will appear here)
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminSubjectSelection;

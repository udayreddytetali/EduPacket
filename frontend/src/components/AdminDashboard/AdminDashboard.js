import NotificationManagement from './PdfManagement';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../MainComponent/MainComponent.css';
import YearSelection from '../YearSelection/YearSelection';
import SemesterTabs from '../SemesterTabs/SemesterTabs';
import GroupSelector from '../GroupSelector/GroupSelector';
import DataTypeSelector from '../DataTypeSelector/DataTypeSelector';
import SubjectSelection from '../SubjectSelection/SubjectSelection';
import { AuthContext } from '../../contexts/Authcontext';
import axios from 'axios';

function PendingUserApprovals() {
  const { token, user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('/api/admin/pending-users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(resp => setPending(resp.data))
      .catch(() => setError('Failed to fetch pending users'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = (userId, action) => {
    setLoading(true);
    setError(null);
    const endpoint = action === 'approve' ? '/api/admin/approve-user' : '/api/admin/reject-user';
    axios.post(endpoint, { userId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setPending(pending.filter(u => u._id !== userId)))
      .catch(() => setError(`Failed to ${action} user`))
      .finally(() => setLoading(false));
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied: You are not authorized to view this page.</div>;
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32, color: '#205761', fontWeight: 700, letterSpacing: 1 }}>Pending User Approvals</h2>
      {loading && <p style={{ textAlign: 'center', color: '#205761' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {pending.length === 0 && !loading && <p style={{ textAlign: 'center', color: '#888' }}>No pending users.</p>}
      {pending.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 8px rgba(32,87,97,0.07)' }}>
            <thead>
              <tr style={{ background: '#e3fbe3' }}>
                <th style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600, color: '#205761', fontSize: 18 }}>Name</th>
                <th style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600, color: '#205761', fontSize: 18 }}>Email</th>
                <th style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600, color: '#205761', fontSize: 18 }}>Role</th>
                <th style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600, color: '#205761', fontSize: 18 }}>Applied On</th>
                <th style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600, color: '#205761', fontSize: 18 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '14px 0', fontSize: 16 }}>{user.name}</td>
                  <td style={{ textAlign: 'center', padding: '14px 0', fontSize: 16 }}>{user.email}</td>
                  <td style={{ textAlign: 'center', padding: '14px 0', fontSize: 16, textTransform: 'capitalize' }}>{user.role}</td>
                  <td style={{ textAlign: 'center', padding: '14px 0', fontSize: 16 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center', padding: '14px 0' }}>
                    <button
                      onClick={() => handleAction(user._id, 'approve')}
                      disabled={loading}
                      style={{
                        background: '#7ed957',
                        color: '#205761',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 18px',
                        fontWeight: 600,
                        marginRight: 10,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(126,217,87,0.08)',
                        transition: 'background 0.2s',
                      }}
                    >Approve</button>
                    <button
                      onClick={() => handleAction(user._id, 'reject')}
                      disabled={loading}
                      style={{
                        background: '#ffe3e3',
                        color: '#b00020',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 18px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(176,0,32,0.08)',
                        transition: 'background 0.2s',
                      }}
                    >Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={() => {
          let rolePath = '';
          if (user && user.role === 'admin') rolePath = '/admin';
          else if (user && user.role === 'teacher') rolePath = '/teacher';
          else if (user && user.role === 'cr') rolePath = '/cr';
          navigate(`${rolePath}/1st-Year/1st-Sem`);
        }}
        style={{
          marginTop: 36,
          background: '#205761',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(32,87,97,0.08)',
          transition: 'background 0.2s',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        ← Back to Main Menu
      </button>
    </div>
  );
}


// --- Restore Deleted Notifications ---
function RestoreDeleted() {
  return <NotificationManagement />;
}

const years = [
  { value: '1st-Year', label: '1st Year' },
  { value: '2nd-Year', label: '2nd Year' },
  { value: '3rd-Year', label: '3rd Year' },
];

const semestersByYear = {
  '1st-Year': [ { value: '1st-Sem', label: '1st Sem' }, { value: '2nd-Sem', label: '2nd Sem' } ],
  '2nd-Year': [ { value: '3rd-Sem', label: '3rd Sem' }, { value: '4th-Sem', label: '4th Sem' } ],
  '3rd-Year': [ { value: '5th-Sem', label: '5th Sem' }, { value: '6th-Sem', label: '6th Sem' } ],
};

const groups = [
  { value: 'BSC-AI', label: 'BSC AI' },
  { value: 'BSC-Data-Science', label: 'BSC Data Science' },
  { value: 'BSC-Computer-Science', label: 'BSC Computer Science' },
  { value: 'BCA', label: 'BCA' },
  { value: 'BBA', label: 'BBA' },
  { value: 'BCom', label: 'B.Com' },
];

function AdminDashboard() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Support CR dashboard path
  const isCR = window.location.pathname.startsWith('/cr');
  const [selectedYear, setSelectedYear] = useState(years[0].value);
  const [selectedSemester, setSelectedSemester] = useState(semestersByYear[years[0].value][0].value);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('');
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  // Sync state from params on mount and when params change
  useEffect(() => {
    if (params.year && years.some(y => y.value === params.year)) {
      setSelectedYear(params.year);
      if (params.semester && semestersByYear[params.year]?.some(s => s.value === params.semester)) {
        setSelectedSemester(params.semester);
      } else {
        setSelectedSemester(semestersByYear[params.year][0].value);
      }
    } else {
      setSelectedYear(years[0].value);
      setSelectedSemester(semestersByYear[years[0].value][0].value);
    }
    setSelectedGroup(params.group || '');
    setSelectedDataType(params.dataType || '');
  }, [params.year, params.semester, params.group, params.dataType]);

  useEffect(() => {
    if (params.year && semestersByYear[params.year]) {
      if (!params.semester || !semestersByYear[params.year].some(s => s.value === params.semester)) {
        setSelectedSemester(semestersByYear[params.year][0].value);
      }
    }
  }, [params.year, params.semester]);

  useEffect(() => {
    let base = '/admin';
    if (user?.role === 'teacher' || window.location.pathname.startsWith('/teacher')) base = '/teacher';
    if (user?.role === 'cr' || isCR) base = '/cr';
    let path = `${base}/${encodeURIComponent(selectedYear)}/${encodeURIComponent(selectedSemester)}`;
    if (selectedGroup) path += `/${encodeURIComponent(selectedGroup)}`;
    if (selectedDataType) path += `/${encodeURIComponent(selectedDataType)}`;
    if (window.location.pathname !== path) {
      navigate(path, { replace: true });
    }
  }, [selectedYear, selectedSemester, selectedGroup, selectedDataType, user, navigate]);

  const handleYearClick = (yearValue) => {
    setSelectedYear(yearValue);
    const semesters = semestersByYear[yearValue] || [];
    setSelectedSemester(semesters[0]?.value || '');
    setSelectedGroup('');
    setSelectedDataType('');
    // Fix: update path to preserve role prefix
    let base = '/admin';
    if (user?.role === 'teacher' || window.location.pathname.startsWith('/teacher')) base = '/teacher';
    if (user?.role === 'cr' || window.location.pathname.startsWith('/cr')) base = '/cr';
    let path = `${base}/${encodeURIComponent(yearValue)}/${encodeURIComponent(semesters[0]?.value || '')}`;
    navigate(path, { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  // Show only PendingUserApprovals or RestoreDeleted if on those routes
  const path = window.location.pathname;
  if (path.includes('/pending-users')) {
    return <PendingUserApprovals />;
  }
  if (path.includes('/restore-deleted')) {
    return <RestoreDeleted />;
  }

  // Otherwise, show the main dashboard (subject selection)
  return (
    <div className="main">
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
        <YearSelection years={years} selectedYear={selectedYear} onYearClick={handleYearClick} />
        {isSidebarVisible && (
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Hide Years"
            aria-expanded={isSidebarVisible}
            type="button"
          >
            Hide Years
          </button>
        )}
      </aside>
      <section className={`content ${isSidebarVisible ? '' : 'expanded'}`}>
        <div className="semester-toggle-row">
          {!isSidebarVisible && (
            <button
              className="show-years-btn"
              onClick={toggleSidebar}
              aria-label="Show Years"
              type="button"
            />
          )}
          <SemesterTabs
            semesters={semestersByYear[selectedYear] || []}
            selectedSemester={selectedSemester}
            onSemesterClick={setSelectedSemester}
          />
        </div>
        <div className="form-row">
          <GroupSelector
            groups={groups}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          />
          <DataTypeSelector
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
          />
        </div>
        <div className="content-remaining-area">
          <SubjectSelection group={selectedGroup} dataType={selectedDataType} year={selectedYear} semester={selectedSemester} role={user?.role} />
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
export { PendingUserApprovals, RestoreDeleted };

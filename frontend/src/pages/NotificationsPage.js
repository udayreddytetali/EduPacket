import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/Authcontext';
import { Link } from 'react-router-dom';
import NotificationList from '../components/NotificationList/NotificationList';

const categories = [
  { key: 'examination', label: 'Examinations' },
  { key: 'circulars', label: 'Circulars' },
  { key: 'jobs', label: 'Jobs' },
];

function NotificationsPage({ initialCategory = 'examinations' }) {
  const [selected, setSelected] = useState(initialCategory);
  const showTabs = initialCategory === undefined;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setSelected(initialCategory);
  }, [initialCategory]);

  // Determine main dashboard path based on user role
  const getMainPath = () => {
    if (user && user.role === 'admin') return '/admin/1st-Year/1st-Sem';
    if (user && user.role === 'teacher') return '/teacher/1st-Year/1st-Sem';
    if (user && user.role === 'cr') return '/cr/1st-Year/1st-Sem';
    return '/1st-Year/1st-Sem';
  };

  return (
    <div style={{height:'55vh', maxWidth: "100%", margin: '20px', padding: '24px 24px 0 24px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)',overflowY: 'auto' }}>
      {showTabs && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelected(cat.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                border: selected === cat.key ? '2px solid #1976d2' : '1px solid #ccc',
                background: selected === cat.key ? '#e3f0ff' : '#f9f9f9',
                color: selected === cat.key ? '#1976d2' : '#222',
                fontWeight: selected === cat.key ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      <NotificationList category={selected} />
      {!showTabs && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => navigate(getMainPath())}
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#1976d2',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
              cursor: 'pointer',
            }}
          >
            Back to Main
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;

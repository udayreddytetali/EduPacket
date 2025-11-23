import React from 'react';

function NotificationDetail({ notification, category }) {
  // Download handler
  const API_BASE = process.env.REACT_APP_API_URL || '';
  const handleDownload = () => {
    window.open(`${API_BASE}/api/${category}/${notification._id}/download`, '_blank');
  };

  // Delete handler (admin/teacher only, for demo just alert)
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/${category}/${notification._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (res.ok) {
          alert('Notification deleted. Please refresh to see changes.');
        } else {
          alert('Delete failed.');
        }
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {notification.link ? (
          <a href={notification.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#1976d2', fontWeight: 600, fontSize: 16, margin: 0 }}>
            {notification.title}
          </a>
        ) : (
          <h4 style={{ margin: 0 }}>{notification.title}</h4>
        )}
        <span style={{ fontSize: 13, color: '#1976d2', fontWeight: 500 }}>
          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
        </span>
        {notification.fileUrl && (
          <button onClick={handleDownload} style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Download PDF</button>
        )}
        {(() => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'admin') {
              return (
                <button onClick={handleDelete} style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 4, background: '#d32f2f', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
              );
            }
          } catch {
            return null;
          }
          return null;
        })()}
      </div>
    </div>
  );
}

export default NotificationDetail;

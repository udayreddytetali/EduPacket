
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/Authcontext';
import DeletedSubjectManagement from '../AdminDashboard/DeletedSubjectManagement';
import DeletedPdfManagement from '../AdminDashboard/DeletedPdfManagement';
import NotificationManagement from '../AdminDashboard/PdfManagement';

const RestoreDeleted = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('subjects');

  if (!user) return <div>Access denied.</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '20px', padding: '24px 24px 0px', background: '#fff', borderRadius: '12px', boxShadow: 'rgba(0, 0, 0, 0.07) 0px 2px 12px', height: '55vh', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#205761', fontWeight: 700, letterSpacing: 1, paddingTop: 10,paddingBottom:10 }}>Restore Deleted Data</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <button
          style={{
            padding: '10px 24px',
            marginRight: 12,
            background: activeTab === 'subjects' ? '#205761' : '#e3fbe3',
            color: activeTab === 'subjects' ? '#fff' : '#205761',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(32,87,97,0.08)',
            transition: 'background 0.2s',
          }}
          onClick={() => setActiveTab('subjects')}
        >Recover Subjects</button>
        <button
          style={{
            padding: '10px 24px',
            marginRight: 12,
            background: activeTab === 'pdfs' ? '#205761' : '#e3fbe3',
            color: activeTab === 'pdfs' ? '#fff' : '#205761',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(32,87,97,0.08)',
            transition: 'background 0.2s',
          }}
          onClick={() => setActiveTab('pdfs')}
        >Recover Model Papers/PDFs</button>
        <button
          style={{
            padding: '10px 24px',
            background: activeTab === 'notifications' ? '#205761' : '#e3fbe3',
            color: activeTab === 'notifications' ? '#fff' : '#205761',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(32,87,97,0.08)',
            transition: 'background 0.2s',
          }}
          onClick={() => setActiveTab('notifications')}
        >Recover Notifications</button>
      </div>
  {activeTab === 'subjects' && <DeletedSubjectManagement />}
  {activeTab === 'pdfs' && <DeletedPdfManagement />}
  {activeTab === 'notifications' && <NotificationManagement />}
      <button
        style={{
          marginTop: 10,
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
        onClick={() => {
          let rolePath = '';
          if (user && user.role === 'admin') rolePath = '/admin';
          else if (user && user.role === 'teacher') rolePath = '/teacher';
          else if (user && user.role === 'cr') rolePath = '/cr';
          window.location.href = `${rolePath}/1st-Year/1st-Sem`;
        }}
      >
        ← Back to Main
      </button>
    </div>
  );
};

export default RestoreDeleted;

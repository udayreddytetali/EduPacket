import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/Authcontext';
import './Header.css';


const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleAdminRequests = () => {
    navigate('/admin/requests');
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={`${process.env.PUBLIC_URL}/website-logo.jpg`} alt="Edupacket logo" height="45px" />
        <h3>Edupacket</h3>
      </div>
      <img src={`${process.env.PUBLIC_URL}/adityalogo.svg`} alt="Aditya Logo" style={{ height: '50px' }} className="aditya-logo" />
      {/* Only show auth-buttons if not logged in */}
      {!user && (
        <div className="auth-buttons">
          <button className="btn login-btn" onClick={handleLogin}>Login</button>
          <button className="btn signup-btn" onClick={handleSignup}>Signup</button>
        </div>
      )}
      {/* No logout button here when user is logged in; user icon will be shown instead */}
      {user && (
  <div className="user-icon-container">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
            alt="User Icon"
            className="user-icon"
            onClick={() => setMenuOpen((open) => !open)}
            style={{ cursor: 'pointer' }}
            aria-label="User menu"
          />
          {menuOpen && (
            <div ref={menuRef} className="floating-menu">
              {user.role === 'admin' && (
                <>
                  <div className="menu-item" onClick={() => { navigate('/admin/requests'); setMenuOpen(false); }}>Check Pending Users</div>
                  <div className="menu-item" onClick={() => { navigate('/admin/restore-deleted'); setMenuOpen(false); }}>Restore Deleted</div>
                </>
              )}
              {user.role === 'teacher' && (
                <div className="menu-item" onClick={() => { navigate('/teacher/restore-deleted'); setMenuOpen(false); }}>Restore Deleted</div>
              )}
              <div className="menu-item" onClick={() => { logout(); setMenuOpen(false); navigate('/1st-Year/1st-Sem'); }}>Logout</div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

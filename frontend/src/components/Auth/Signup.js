import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const isValidEmail = (email) =>
  email.toLowerCase().includes('gmail.com');


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [isStrong, setIsStrong] = useState(null);
  const [signupMsg, setSignupMsg] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsStrong(strongPasswordRegex.test(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      alert('Please enter a valid Gmail address (e.g. user@gmail.com)');
      return;
    }
    if (!isStrong) {
      alert('Please enter a strong password.');
      return;
    }

    try {
      await axios.post('{API_BASE}/api/auth/signup', {
        name,
        email,
        password,
        role
      });
      setSignupSuccess(true);
      if (role === 'student') {
        setSignupMsg('Signup successful! You can now log in.');
      } else {
        setSignupMsg('Signup successful! Please wait for admin approval before logging in.');
      }
    } catch (err) {
      setSignupSuccess(false);
      setSignupMsg(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className={styles.authContainer}>
      {signupMsg ? (
        <div style={{
          background: signupSuccess ? '#e3fbe3' : '#ffe3e3',
          color: signupSuccess ? '#205761' : '#b00020',
          border: `1.5px solid ${signupSuccess ? '#7ed957' : '#b00020'}`,
          borderRadius: '6px',
          padding: '1.2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: 500
        }}>{signupMsg}</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.title}>Sign Up for EduPacket</h2>
          <label className={styles.label}>
            Full Name
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </label>
          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className={styles.label}>
            Password
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Choose a strong password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  // Eye open SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#205761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  // Eye closed SVG
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#205761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                    <line x1="3" y1="3" x2="21" y2="21" stroke="#205761" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div style={{ fontSize: '0.9em', marginTop: '0.2em', color: isStrong ? 'green' : 'red' }}>
                {isStrong ? 'Strong password.' : 'Must be 8+ chars, include upper & lower case, number, and special char.'}
              </div>
            )}
          </label>
          <label className={styles.label}>
            Role
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="cr">Class Representative (CR)</option>
            </select>
          </label>
          <button type="submit" className={styles.button}>Sign Up</button>
        </form>
      )}
      <Link to="/1st-Year/1st-Sem" className={styles.backButton}>
        Back to Main
      </Link>
    </div>
  );
};

export default Signup;

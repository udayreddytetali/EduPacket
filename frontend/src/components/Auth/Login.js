
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from '../../contexts/Authcontext';
import styles from "./Auth.module.css";


const Login = ({ hasBackToMain }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === "admin") {
        navigate("/admin/1st-Year/1st-Sem");
      } else if (res.data.user.role === "teacher") {
        navigate("/teacher/1st-Year/1st-Sem");
      } else if (res.data.user.role === "cr") {
        navigate("/cr/1st-Year/1st-Sem");
      } else {
        navigate("/1st-Year/1st-Sem");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  const { user } = useContext(AuthContext);
  const backToMain = () => {
    if (user && user.role === 'admin') {
      navigate("/admin/1st-Year/1st-Sem");
    } else if (user && user.role === 'teacher') {
      navigate("/teacher/1st-Year/1st-Sem");
    } else if (user && user.role === 'cr') {
      navigate("/cr/1st-Year/1st-Sem");
    } else {
      navigate("/1st-Year/1st-Sem");
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Login</h2>
        {error && (
          <div style={{ color: 'red', marginBottom: '1em', textAlign: 'center' }}>{error}</div>
        )}
        <label className={styles.label}>
          Email
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className={styles.label} style={{ position: 'relative' }}>
          Password
          <input
            type={showPassword ? "text" : "password"}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword ? (
              // Eye open SVG
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#205761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              // Eye closed SVG (full eye with strikethrough)
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#205761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke="#205761" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </label>
        <button type="submit" className={styles.button}>
          Login
        </button>
        {hasBackToMain && (
          <button
            type="button"
            className={styles.backButton}
            onClick={backToMain}
          >
            Back to Main
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/Authcontext';

const API_BASE = process.env.REACT_APP_API_BASE;

function AdminDashboard({ showPendingOnly = false }) {
  const { token, user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    // Only fetch pending users if showPendingOnly is true (for /admin/requests)
    if (showPendingOnly && user.role !== "admin") return;

    setLoading(true);
    setError(null);

    const url = showPendingOnly ? `${API_BASE}/api/admin/pending-users` : null;

    if (url) {
      axios
        .get(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((resp) => {
          console.log("ADMIN API RESPONSE =", resp.data);
          setPending(resp.data);
        })
        .catch((err) => {
          console.log("ADMIN API ERROR =", err.response?.data);
          setError("Failed to fetch pending users");
        })
        .finally(() => setLoading(false));
    }
  }, [token, showPendingOnly, user]);

  const handleAction = (userId, action) => {
    setLoading(true);
    setError(null);

    const endpoint =
      action === "approve"
        ? `${API_BASE}/api/admin/approve-user`
        : `${API_BASE}/api/admin/reject-user`;

    axios
      .post(endpoint, { userId }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setPending((prev) => prev.filter((u) => u._id !== userId)))
      .catch(() => setError(`Failed to ${action} user`))
      .finally(() => setLoading(false));
  };

  // Access control for Admin dashboard
  if (!user || (showPendingOnly && user.role !== "admin")) {
    return (
      <div style={{ textAlign: "center", marginTop: 30, color: "red" }}>
        Access Denied: You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 40 }}>
      {showPendingOnly && (
        <h2
          style={{
            textAlign: "center",
            marginBottom: 32,
            color: "#205761",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Pending User Approvals
        </h2>
      )}

      {loading && <p style={{ textAlign: "center", color: "#205761" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {showPendingOnly && pending.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "#888" }}>There are no pending users.</p>
      )}

      {showPendingOnly && pending.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              background: "#f9f9f9",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(32,87,97,0.07)",
            }}
          >
            <thead>
              <tr style={{ background: "#e3fbe3" }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Applied On</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pending.map((usr) => (
                <tr key={usr._id} style={{ borderBottom: "1px solid #e0e0e0", background: "#fff" }}>
                  <td style={styles.td}>{usr.name}</td>
                  <td style={styles.td}>{usr.email}</td>
                  <td style={styles.td}>{usr.role}</td>
                  <td style={styles.td}>{new Date(usr.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleAction(usr._id, "approve")} disabled={loading} style={styles.approveBtn}>
                      Approve
                    </button>
                    <button onClick={() => handleAction(usr._id, "reject")} disabled={loading} style={styles.rejectBtn}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => {
          let rolePath = "/admin";
          if (user.role === "teacher") rolePath = "/teacher";
          if (user.role === "cr") rolePath = "/cr";

          navigate(`${rolePath}/1st-Year/1st-Sem`);
        }}
        style={styles.backBtn}
      >
        ← Back to Main Menu
      </button>
    </div>
  );
}

const styles = {
  th: {
    padding: "16px 0",
    textAlign: "center",
    fontWeight: 600,
    color: "#205761",
    fontSize: 18,
  },
  td: {
    textAlign: "center",
    padding: "14px 0",
    fontSize: 16,
  },
  approveBtn: {
    background: "#7ed957",
    color: "#205761",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    fontWeight: 600,
    marginRight: 10,
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#ffe3e3",
    color: "#b00020",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
  backBtn: {
    marginTop: 36,
    background: "#205761",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 24px",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
};

export default AdminDashboard;

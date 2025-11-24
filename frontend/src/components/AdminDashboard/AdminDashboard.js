import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { axios } from "../../api"; // Named export from api.js
import { AuthContext } from "../../contexts/Authcontext";

function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch pending users when component mounts
  useEffect(() => {
    if (!token || !user || user.role !== "admin") return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    axios
      .get("/api/admin/pending-users") // Authorization header already set via AuthContext
      .then((res) => {
        if (isMounted) setPending(res.data);
      })
      .catch((err) => {
        console.error("Error fetching pending users:", err.response || err.message);
        if (isMounted) setError("Failed to fetch pending users");
      })
      .finally(() => isMounted && setLoading(false));

    return () => { isMounted = false; };
  }, [token, user]);

  const handleAction = (userId, action) => {
    setLoading(true);
    setError(null);

    const endpoint =
      action === "approve" ? "/api/admin/approve-user" : "/api/admin/reject-user";

    axios
      .post(endpoint, { userId }) // Auth header already included
      .then(() => setPending((prev) => prev.filter((u) => u._id !== userId)))
      .catch(() => setError(`Failed to ${action} user`))
      .finally(() => setLoading(false));
  };

  if (!user || user.role !== "admin") {
    return (
      <div style={{ textAlign: "center", marginTop: 30, color: "red" }}>
        Access Denied: You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 32, color: "#205761" }}>
        Pending User Approvals
      </h2>

      {loading && <p style={{ textAlign: "center", color: "#205761" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {pending.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "#888" }}>No pending users.</p>
      )}

      {pending.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
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
                    <button onClick={() => handleAction(usr._id, "approve")} style={styles.approveBtn} disabled={loading}>
                      Approve
                    </button>
                    <button onClick={() => handleAction(usr._id, "reject")} style={styles.rejectBtn} disabled={loading}>
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
        onClick={() => navigate("/admin/1st-Year/1st-Sem")}
        style={styles.backBtn}
      >
        ← Back to Main Menu
      </button>
    </div>
  );
}

const styles = {
  th: { padding: "16px 0", textAlign: "center", fontWeight: 600, color: "#205761", fontSize: 18 },
  td: { textAlign: "center", padding: "14px 0", fontSize: 16 },
  approveBtn: { background: "#7ed957", color: "#205761", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, marginRight: 10, cursor: "pointer" },
  rejectBtn: { background: "#ffe3e3", color: "#b00020", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" },
  backBtn: { marginTop: 36, background: "#205761", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 600, fontSize: 16, cursor: "pointer", display: "block", marginLeft: "auto", marginRight: "auto" },
};

export default AdminDashboard;

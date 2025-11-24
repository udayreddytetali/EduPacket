function AdminDashboard({ role }) {
  const { token, user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Only fetch pending users if admin
  useEffect(() => {
    if (!token || role !== "admin") return;

    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((resp) => setPending(resp.data))
      .catch(() => setError("Failed to fetch pending users"))
      .finally(() => setLoading(false));
  }, [token, role]);

  const handleAction = (userId, action) => {
    if (role !== "admin") return; // Non-admins cannot approve/reject

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

  if (!user || (role === "admin" && user.role !== "admin")) {
    return (
      <div style={{ textAlign: "center", marginTop: 30 }}>
        Access denied: You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 40 }}>
      {role === "admin" && (
        <>
          <h2 style={{ textAlign: "center", marginBottom: 32, color: "#205761" }}>
            Pending User Approvals
          </h2>
          {loading && <p style={{ textAlign: "center", color: "#205761" }}>Loading...</p>}
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          {pending.length === 0 && !loading && (
            <p style={{ textAlign: "center", color: "#888" }}>No pending users.</p>
          )}
          {pending.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
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
                    <tr key={usr._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={styles.td}>{usr.name}</td>
                      <td style={styles.td}>{usr.email}</td>
                      <td style={styles.td}>{usr.role}</td>
                      <td style={styles.td}>{new Date(usr.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleAction(usr._id, "approve")}
                          disabled={loading}
                          style={styles.approveBtn}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(usr._id, "reject")}
                          disabled={loading}
                          style={styles.rejectBtn}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* All roles can see a back button */}
      <button
        onClick={() => {
          let rolePath = role;
          if (role === "teacher") rolePath = "/teacher";
          if (role === "cr") rolePath = "/cr";
          navigate(`${rolePath}/1st-Year/1st-Sem`);
        }}
        style={styles.backBtn}
      >
        ← Back to Main Menu
      </button>
    </div>
  );
}

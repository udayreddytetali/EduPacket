import React, { useState, useEffect, useContext } from 'react';
import { axios } from '../../api';
import { AuthContext } from '../../contexts/Authcontext';

export default function PendingUserApprovals() {
  const { token } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    axios
      .get(`/api/admin/pending-users`)
      .then((resp) => {
        console.log("ADMIN REQUEST PAGE RESPONSE =", resp.data);
        setPending(resp.data);
      })
      .catch((err) => {
        console.log("ADMIN REQUEST PAGE ERROR =", err.response?.data);
        setError("Failed to fetch pending users");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = (userId, action) => {
    setLoading(true);
    setError(null);

    const endpoint = action === "approve" ? "/api/admin/approve-user" : "/api/admin/reject-user";

    axios
      .post(endpoint, { userId })
      .then(() => setPending((p) => p.filter((u) => u._id !== userId)))
      .catch(() => setError(`Failed to ${action} user`))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>Pending User Approvals</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
      {pending.length === 0 && !loading && (
        <p style={{ textAlign: "center" }}>No pending users.</p>
      )}

      {pending.length > 0 && (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((usr) => (
              <tr key={usr._id}>
                <td>{usr.name}</td>
                <td>{usr.email}</td>
                <td>{usr.role}</td>
                <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleAction(usr._id, "approve")}>Approve</button>
                  <button onClick={() => handleAction(usr._id, "reject")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

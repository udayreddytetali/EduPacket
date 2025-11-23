import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/Authcontext";

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        Access Denied. Admins only.
      </div>
    );
  }

  return children;
}

export default AdminRoute;

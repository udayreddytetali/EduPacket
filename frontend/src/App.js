import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header/Header";
import MainComponent from "./components/MainComponent/MainComponent";
import Footer from "./components/Footer/Footer";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

import RestoreDeleted from "./components/RestoreDeleted/RestoreDeleted";
import NotificationsPage from "./pages/NotificationsPage";
import { AuthContext, AuthProvider } from "./contexts/Authcontext"; // Your auth context

// AdminRoute wrapper protects admin routes based on user role
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

// Redirect to role-based dashboard
function RoleRedirect() {
  const { user } = useContext(AuthContext);
  if (user && user.role === "admin") return <Navigate to="/admin/1st-Year/1st-Sem" replace />;
  if (user && user.role === "teacher") return <Navigate to="/teacher/1st-Year/1st-Sem" replace />;
  if (user && user.role === "cr") return <Navigate to="/cr/1st-Year/1st-Sem" replace />;
  return <Navigate to="/1st-Year/1st-Sem" replace />;
}

function AppContent() {
  const location = useLocation();

  // Paths on which footer should be hidden
  const hideFooterPaths = ["/login", "/signup", "/admin", "/admin/requests"];
  const isFooterHidden = hideFooterPaths.includes(location.pathname);

  return (
    <>
      <Header />
      <Routes>
        {/* Admin dashboard: show admin controls plus the MainComponent (subjects UI) */}
        <Route
          path="/admin/:year/:semester/:group?/:dataType?"
          element={
            <AdminRoute>
              <>
                <AdminDashboard />
                <MainComponent />
              </>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <>
                <AdminDashboard />
                <MainComponent />
              </>
            </AdminRoute>
          }
        />

        {/* Teacher dashboard (use MainComponent to show subjects for teachers) */}
        <Route path="/teacher/:year/:semester/:group?/:dataType?" element={<MainComponent />} />

        {/* CR dashboard (class reps also see the main subject view) */}
        <Route path="/cr/:year/:semester/:group?/:dataType?" element={<MainComponent />} />

        {/* Main pages */}
        <Route path="/:year/:semester/:group?/:dataType?" element={<MainComponent />} />
        <Route path="/examination" element={<NotificationsPage initialCategory="examination" />} />
        <Route path="/circulars" element={<NotificationsPage initialCategory="circulars" />} />
        <Route path="/jobs" element={<NotificationsPage initialCategory="jobs" />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route path="/login" element={<Login hasBackToMain />} />
        <Route path="/signup" element={<Signup hasBackToMain />} />

        {/* Pending user approvals (admin only) */}
        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <div
                style={{
                  maxWidth: 900,
                  margin: "40px auto",
                  padding: 32,
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                <AdminDashboard />
              </div>
            </AdminRoute>
          }
        />

        {/* Restore deleted */}
        <Route
          path="/admin/restore-deleted"
          element={
            <AdminRoute>
              <RestoreDeleted />
            </AdminRoute>
          }
        />
        <Route path="/teacher/restore-deleted" element={<RestoreDeleted />} />

        {/* Fallback */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>

      {!isFooterHidden && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

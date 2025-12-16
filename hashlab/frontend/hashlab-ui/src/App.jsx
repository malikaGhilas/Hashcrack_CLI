import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";


import LoginPage from "./pages/LoginPage.jsx";
import ShellLayout from "./layouts/ShellLayout.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import NewJobPage from "./pages/NewJobPage.jsx";
import HashToolsPage from "./pages/HashToolsPage.jsx";
import PasswordToolsPage from "./pages/PasswordToolsPage.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />


      {/* Layout protégé */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ShellLayout />
          </ProtectedRoute>
        }
      >
        {/* 👇 Sous-pages */}
        <Route index element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<NewJobPage />} />
        <Route path="tools/hash" element={<HashToolsPage />} />
        <Route path="tools/password" element={<PasswordToolsPage />} />
      </Route>

      {/* Route inconnue → Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

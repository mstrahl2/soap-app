// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";

import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyNotes from "./pages/MyNotes";
import NewNote from "./pages/NewNote";
import ProfileUpdate from "./pages/ProfileUpdate";
import Profile from "./pages/Profile";
import MyAccount from "./pages/MyAccount";
import EditNote from "./pages/EditNote";
import NoteDetail from "./pages/NoteDetail";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireProfileComplete from "./components/RequireProfileComplete";

function RequireAuth({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          color: "#555",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route
          path="login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
        />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route
          path="dashboard"
          element={
            <RequireAuth user={user}>
              <RequireProfileComplete>
                <Dashboard />
              </RequireProfileComplete>
            </RequireAuth>
          }
        />
        <Route
          path="new-note"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <NewNote />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="my-notes"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <MyNotes />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="edit-note/:id"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <EditNote />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="note-detail/:id"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <NoteDetail />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="profile-update"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <ProfileUpdate />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <Profile />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route
          path="my-account"
          element={
            <RequireAuth user={user}>
              <ErrorBoundary>
                <MyAccount />
              </ErrorBoundary>
            </RequireAuth>
          }
        />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

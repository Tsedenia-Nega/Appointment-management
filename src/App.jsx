import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import CreateAppointment from "./components/CreateAppointment";
import EditAppointment from "./pages/EditAppointment";
import ViewAppointment from "./pages/ViewAppointment";
import SecretaryPage from "./pages/SecretaryPage";
import SecurityPage from "./pages/SecurityPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppointmentRequests from "./pages/Appointment";
import PendingAppointmentsPage from "./pages/PendingAppointments";
import { PERMISSIONS } from "./permissions";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import Integrity from "./pages/Integrity";
import CreateAccount from "./pages/CreateAccount";
import RolesPage from "./pages/RolesPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/createAccount" element={<CreateAccount />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/integrity" element={<Integrity />} />
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_ROLES}>
              <Layout>
                <RolesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.APPROVE_REQUEST}>
              <Layout>
                <PendingAppointmentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/create"
          element={
            <Layout>
              <CreateAppointment />
            </Layout>
          }
        />
        <Route path="/edit" element={<EditAppointment />} />
        <Route
          path="/view"
          element={
            <Layout>
              <ViewAppointment />
            </Layout>
          }
        />
        <Route
          path="/appointment"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.APPROVE_REQUEST}>
              <Layout>
                <AppointmentRequests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.CHECK_IN}>
              <Layout>
                <SecretaryPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.CHECK_OUT}>
              <Layout>
                <SecurityPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

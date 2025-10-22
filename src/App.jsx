import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import CreateAppointment from "./components/CreateAppointment";
import ViewAppointment from "./pages/ViewAppointment";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PendingAppointmentsPage from "./pages/PendingAppointments";
import { PERMISSIONS } from "./permissions";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import RolesPage from "./pages/RolesPage";
import CreateAccount from "./pages/CreateAccount";
import CheckInPage from "./pages/CheckInPage";
import SecurityCheckPage from "./pages/SecurityCheckPage";
import CEORegister from "./pages/CEORegister";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DASHBOARD}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_APPOINTMENT}>
              <Layout>
                <CreateAppointment />
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
          path="/checkin"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.CHECK_IN}>
              <Layout>
                <CheckInPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_ROLES}>
              <Layout>
                <CreateAccount />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.CHECK_OUT}>
              <Layout>
                <SecurityCheckPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/view"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_APPOINTMENT}>
              <Layout>
                <ViewAppointment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/register-ceo" element={<CEORegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

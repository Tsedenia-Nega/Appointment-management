import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import CreateAppointment from "./components/CreateAppointment";
import CreateAccount from "./components/CreateAccount";
import EditAppointment from "./pages/EditAppointment";
import ViewAppointment from "./pages/ViewAppointment";
import SecretaryPage from "./pages/SecretaryPage";
import SecurityPage from "./pages/SecurityPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppointmentRequests from "./pages/Appointment";
import PendingAppointmentsPage from "./pages/PendingAppointments";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pending" element={<PendingAppointmentsPage />} />
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }
        /> */}
        <Route path="/signup" element={<CreateAccount />} />
        <Route path="/create" element={<CreateAppointment />} />
        <Route path="/edit" element={<EditAppointment />} />
        <Route path="/view" element={<ViewAppointment />} />
        <Route path="/appointment" element={<AppointmentRequests />} />
        <Route path="/secretary" element={<SecretaryPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </Router>
  );
}

export default App;

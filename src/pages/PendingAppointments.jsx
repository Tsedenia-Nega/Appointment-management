import React, { useState, useEffect } from "react";
import {
  Eye,
  X,
  User,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Check,
  Slash,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

// Mock data
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    firstName: "Christine",
    middleName: "Abeba",
    lastName: "Brooks",
    email: "Lidu@gmail.com",
    date: "04 Sep 2025",
    status: "Pending",
    phone: "0912345676",
    country: "Ethiopia",
    organization: "University",
    occupation: "Student",
    time: "04:20 PM - 06:00 PM",
    purpose:
      "To conduct a research interview on local market trends for a university project.",
  },
  {
    id: 2,
    firstName: "Michael",
    middleName: "T.",
    lastName: "Jones",
    email: "mike@corp.com",
    date: "05 Sep 2025",
    status: "Pending",
    phone: "0923456789",
    country: "United States",
    organization: "Tech Corp",
    occupation: "Manager",
    time: "10:00 AM - 11:00 AM",
    purpose:
      "VIP meeting with CEO regarding potential partnership and investment.",
  },
];

const allowedOptions = [
  "All",
  "Computer",
  "PC",
  "Mobile",
  "Document",
  "USB Drive",
  "Camera",
];

// Helper component for cleaner detail presentation
const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-2 text-gray-700">
    <Icon size={18} className="text-blue-500 mt-1 flex-shrink-0" />
    <div className="flex flex-col">
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

//---------------------------------------------------------

export default function PendingAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [allowedMaterialSelection, setAllowedMaterialSelection] = useState([]);
  // 🆕 Renamed state for Security Check Requirement
  const [securityCheckRequired, setSecurityCheckRequired] = useState(null);

  useEffect(() => {
    // ⚠️ In a real app, fetch pending appointments from backend
    const pending = MOCK_APPOINTMENTS.filter((a) => a.status === "Pending");
    setAppointments(pending);
  }, []);

  // Initialize states when a new appointment is opened
  useEffect(() => {
    if (selectedAppointment) {
      setAllowedMaterialSelection([]);
      // 🆕 Reset security status to null
      setSecurityCheckRequired(null);
    }
  }, [selectedAppointment]);

  const handleCloseDrawer = () => {
    setSelectedAppointment(null);
  };

  const handleOpenDrawer = (appt) => {
    setSelectedAppointment(appt);
  };

  // --- ACTION HANDLERS ---

  const handleApprove = () => {
    if (!selectedAppointment) return;

    // ⚠️ API CALL: Send the approval status, approved materials, and security requirement status

    console.log(`Approving ID: ${selectedAppointment.id}`);
    console.log(
      `- Approved Materials: ${allowedMaterialSelection.join(", ") || "None"}`
    );
    console.log(
      `- Security Check Required: ${securityCheckRequired || "Not Specified"}`
    );

    // Simulate removal from pending view
    setAppointments((prev) =>
      prev.filter((a) => a.id !== selectedAppointment.id)
    );
    handleCloseDrawer();
  };

  const handleReject = () => {
    if (!selectedAppointment) return;

    // ⚠️ API CALL: Send the rejection status and security requirement status

    console.log(`Rejecting ID: ${selectedAppointment.id}`);
    console.log(
      `- Security Check Required: ${securityCheckRequired || "Not Specified"}`
    );

    // Simulate removal from pending view
    setAppointments((prev) =>
      prev.filter((a) => a.id !== selectedAppointment.id)
    );
    handleCloseDrawer();
  };

  // Handler for material selection changes (checkboxes)
  const handleMaterialChange = (e) => {
    const material = e.target.value;
    const isChecked = e.target.checked;

    setAllowedMaterialSelection((prev) => {
      if (isChecked) {
        return [...prev, material];
      } else {
        return prev.filter((m) => m !== material);
      }
    });
  };

  // 🆕 Handler for security radio buttons (Required/Not Required)
  const handleSecurityChange = (e) => {
    setSecurityCheckRequired(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Pending Appointments
      </h1>

      {/* -------------------------------------- */}
      {/* TABLE VIEW */}
      {/* -------------------------------------- */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border">
        <table className="min-w-full divide-y divide-gray-200 text-gray-700">
          <thead className="bg-gray-100 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="py-3 px-4 text-left">No</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {appointments.length > 0 ? (
              appointments.map((appt, idx) => (
                <tr
                  key={appt.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {appt.firstName} {appt.middleName} {appt.lastName}
                  </td>
                  <td className="py-3 px-4 text-sm">{appt.email}</td>
                  <td className="py-3 px-4 text-sm font-medium">{appt.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Eye
                      size={18}
                      className="text-gray-500 hover:text-blue-600 cursor-pointer inline-block"
                      onClick={() => handleOpenDrawer(appt)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500 italic"
                >
                  No pending appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------- */}
      {/* 🔹 SLIDE-OVER DRAWER (Details & Actions) */}
      {/* -------------------------------------- */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          selectedAppointment
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={handleCloseDrawer} // Close on backdrop click
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            selectedAppointment ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking panel content
        >
          {selectedAppointment && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Appointment Review
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-700"
                  onClick={handleCloseDrawer}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 overflow-y-auto flex-grow space-y-8">
                {/* 1. VISITOR DETAILS */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <User size={20} className="mr-2 text-blue-600" /> Visitor
                    Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      label="First Name"
                      value={selectedAppointment.firstName}
                      icon={User}
                    />
                    <DetailItem
                      label="Middle Name"
                      value={selectedAppointment.middleName}
                      icon={User}
                    />
                    <DetailItem
                      label="Last Name"
                      value={selectedAppointment.lastName}
                      icon={User}
                    />
                    <DetailItem
                      label="Occupation"
                      value={selectedAppointment.occupation}
                      icon={Briefcase}
                    />
                    <DetailItem
                      label="Organization"
                      value={selectedAppointment.organization}
                      icon={Briefcase}
                    />
                    <DetailItem
                      label="Country"
                      value={selectedAppointment.country}
                      icon={MapPin}
                    />
                    <DetailItem
                      label="Email"
                      value={selectedAppointment.email}
                      icon={Mail}
                    />
                    <DetailItem
                      label="Phone"
                      value={selectedAppointment.phone}
                      icon={Phone}
                    />
                  </div>
                </div>

                {/* 2. APPOINTMENT DETAILS */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <Calendar size={20} className="mr-2 text-blue-600" />{" "}
                    Appointment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      label="Date"
                      value={selectedAppointment.date}
                      icon={Calendar}
                    />
                    <DetailItem
                      label="Time Slot"
                      value={selectedAppointment.time}
                      icon={Calendar}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mt-2">
                      Purpose
                    </p>
                    <p className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                      {selectedAppointment.purpose}
                    </p>
                  </div>
                </div>

                {/* 3. MATERIAL ASSIGNMENT (Optional Checkboxes) */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <RotateCcw size={20} className="mr-2 text-blue-600" />{" "}
                    Material Assignment (Optional)
                  </h4>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      **Select Allowed Materials**
                    </label>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border rounded-lg">
                      {allowedOptions.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`material-${opt}`}
                            value={opt}
                            checked={allowedMaterialSelection.includes(opt)}
                            onChange={handleMaterialChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`material-${opt}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {opt}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. 🆕 SECURITY CHECK REQUIREMENT */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
                    <ShieldCheck size={20} className="mr-2 text-blue-600" />{" "}
                    Security Check Requirement
                  </h4>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      **Is a Security Check Required for this visitor?**
                    </label>

                    <div className="flex space-x-6 p-3 bg-gray-50 border rounded-lg">
                      {["Required", "Not Required"].map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`security-${status}`}
                            name="security-check-required"
                            value={status}
                            checked={securityCheckRequired === status}
                            onChange={handleSecurityChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`security-${status}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={handleReject}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md"
                >
                  <Slash size={18} className="mr-1" /> Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md"
                >
                  <Check size={18} className="mr-1" /> Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

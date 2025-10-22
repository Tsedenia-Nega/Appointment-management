import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Icons for visual appeal
import {
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

// --- Time Helpers (Unchanged Logic) --------------------------------------------
const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

function to24HourString(hour12, minute, period) {
  let h = parseInt(hour12, 10);
  if (period === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toMinutesSinceMidnight(hour24Str, minuteStr) {
  const h = parseInt(hour24Str, 10);
  const m = parseInt(minuteStr, 10);
  return h * 60 + m;
}

// --- Reusable Input Component (Slightly Reduced Padding) ------------------------------------
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  icon: Icon,
}) => (
  <div className="relative">
    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1 tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <span className="absolute left-3 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        required={required}
        // Reduced py-2 to py-1.5 for compactness, kept px-4 for readability
        className={`w-full border border-gray-300 rounded-lg px-4 py-1.5 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm ${
          Icon ? "pl-9" : "pl-4"
        }`}
      />
    </div>
  </div>
);

// --- Time Group Component (Reduced Padding and Margin) ----------------------------------------
const TimeSelectGroup = ({ formData, handleChange, namePrefix, label }) => (
  <div className="w-full">
    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1 tracking-wider">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="flex items-center w-full border border-gray-300 rounded-lg shadow-sm overflow-hidden h-[34px]">
      <select
        name={`${namePrefix}Hour`}
        value={formData[`${namePrefix}Hour`]}
        onChange={handleChange}
        // Reduced py-2 to py-1 for compactness
        className="w-1/3 px-2 py-1 text-sm bg-white focus:ring-0 focus:border-none outline-none appearance-none cursor-pointer"
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-gray-500 font-bold text-xs">:</span>

      <select
        name={`${namePrefix}Minute`}
        value={formData[`${namePrefix}Minute`]}
        onChange={handleChange}
        // Reduced py-2 to py-1 for compactness
        className="w-1/3 px-2 py-1 text-sm bg-white focus:ring-0 focus:border-none outline-none appearance-none cursor-pointer border-l border-r border-gray-200"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        name={`${namePrefix}Period`}
        value={formData[`${namePrefix}Period`]}
        onChange={handleChange}
        // Reduced py-2 to py-1 for compactness
        className="w-1/3 px-2 py-1 text-xs bg-blue-50 text-blue-700 font-semibold focus:ring-0 focus:border-none outline-none appearance-none cursor-pointer"
      >
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  </div>
);

// --- Main Form Component (Compacted Layout) ------------------------------
export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    country: "",
    city: "",
    organization: "",
    occupation: "",
    date: "",
    startHour: "09",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "10",
    endMinute: "00",
    endPeriod: "AM",
    plateNumber: "",
    purpose: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start24 = to24HourString(
      formData.startHour,
      formData.startMinute,
      formData.startPeriod
    );
    const end24 = to24HourString(
      formData.endHour,
      formData.endMinute,
      formData.endPeriod
    );

    const [sH, sM] = start24.split(":");
    const [eH, eM] = end24.split(":");
    if (toMinutesSinceMidnight(sH, sM) >= toMinutesSinceMidnight(eH, eM)) {
      setMessage("End time must be after start time.");
      setMessageType("error");
      return;
    }

    const payload = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      plateNum: formData.plateNumber,
      country: formData.country,
      city: formData.city,
      organization: formData.organization,
      occupation: formData.occupation,
      appointmentDate: formData.date,
      timeFrom: start24,
      timeTo: end24,
      purpose: formData.purpose,
    };

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || "Failed to create appointment");
      }

      await res.json();
      setMessage("Appointment created successfully! Redirecting...");
      setMessageType("success");

      // Reset form
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        country: "",
        city: "",
        organization: "",
        occupation: "",
        date: "",
        startHour: "09",
        startMinute: "00",
        startPeriod: "AM",
        endHour: "10",
        endMinute: "00",
        endPeriod: "AM",
        plateNumber: "",
        purpose: "",
      });

      setTimeout(() => navigate("/create"), 1200);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage(
        "Failed to create appointment. Please check the details and try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Max width reduced for a more compact form feel, still using the nice BG
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 pb-1 sm:p-4 relative overflow-hidden">
      {/* Decorative Background Circles (Kept for visual interest) */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-blue-10 rounded-full opacity-30 blur-3xl mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-150px] left-[-150px] w-80 h-80 bg-indigo-200 rounded-full opacity-30 blur-3xl mix-blend-multiply animate-pulse animation-delay-500"></div>

      {/* Max-width reduced from 4xl to 2xl, padding reduced from p-10 to p-6 */}
      <div className=" bg-white rounded-2xl shadow-xl w-full max-w-2xl pb-2 sm:p-4 z-10">
        {/* <header className="text-center "> */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
            Create Appointment
          </h2>
         
        {/* </header> */}

        {/* Message Alert Component */}
        {message && (
          <div
            className={`flex items-center text-sm mb-4 px-3 py-2 rounded-lg border-l-4 ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border-green-500"
                : "bg-red-50 text-red-700 border-red-500"
            }`}
          >
            {messageType === "success" ? (
              <FiCheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <FiAlertCircle className="w-4 h-4 mr-2" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PERSONAL INFORMATION SECTION */}
          {/* Reduced padding from p-6 to p-4, smaller gap */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-base font-bold text-gray-800 flex items-center pb-2 border-b border-gray-200">
              <FiUser className="w-4 h-4 mr-2 text-blue-500" />
              Personal Details
            </h3>

            {/* **COMPACTED LAYOUT: Two columns for most fields** */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Name fields in one row (3 cols on small screens, condensed into 2 main columns below) */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  icon={FiUser}
                />
                <FormInput
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  required={false}
                  icon={FiUser}
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  icon={FiUser}
                />
              </div>

              {/* Contact fields in two columns */}
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={FiMail}
              />
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                icon={FiPhone}
              />

              {/* Location fields in two columns */}
              <FormInput
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                icon={FiMapPin}
              />
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={FiMapPin}
              />

              {/* Organization/Occupation fields in two columns */}
              <FormInput
                label="Organization (Optional)"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required={false}
                icon={FiBriefcase}
              />
              <FormInput
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                icon={FiBriefcase}
              />

              {/* Gender and Plate fields in two columns */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1 tracking-wider">
                  Gender <span className="text-red-500">*</span>
                </label>
                {/* Reduced height of the radio group */}
                <div className="flex space-x-6 h-[34px] items-center">
                  {["Female", "Male"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        required
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4 mr-2 border-gray-300"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              <FormInput
                label="Plate Number (Optional)"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                required={false}
                icon={FiBriefcase}
              />
            </div>
          </div>

          {/* APPOINTMENT DETAILS SECTION */}
          {/* Reduced padding from p-6 to p-4, smaller gap */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 flex items-center pb-2 border-b border-gray-200">
              <FiCalendar className="w-4 h-4 mr-2 text-blue-500" />
              Appointment Details
            </h3>

            {/* **Compacted Time Group** */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1 tracking-wider">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  // Reduced py-2 to py-1.5, rounded-xl to rounded-lg
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
                />
              </div>

              <TimeSelectGroup
                formData={formData}
                handleChange={handleChange}
                namePrefix="start"
                label="Start Time"
              />
              <TimeSelectGroup
                formData={formData}
                handleChange={handleChange}
                namePrefix="end"
                label="End Time"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1 tracking-wider">
                Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows={3} // Reduced rows from 4 to 3
                required
                placeholder="Briefly describe the purpose of the appointment..."
                // Reduced py-2 to py-1.5, rounded-xl to rounded-lg
                className="w-full border border-gray-300 rounded-lg px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            // Reduced py-3 to py-2, text-lg to text-base, rounded-xl to rounded-lg
            className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg px-6 py-2 text-base font-bold uppercase tracking-wider hover:bg-blue-700 transition duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.005]"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FiSend className="w-4 h-4 mr-2" />
                Create Appointment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

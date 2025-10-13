import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

// Reusable input component
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
    />
  </div>
);

// Time group component
const TimeSelectGroup = ({ formData, handleChange, namePrefix }) => (
  <div className="flex items-center w-full">
    <select
      name={`${namePrefix}Hour`}
      value={formData[`${namePrefix}Hour`]}
      onChange={handleChange}
      className="w-1/3 border border-gray-300 rounded-l-lg px-2 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
    >
      {hours.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>

    <span className="text-gray-500 font-semibold px-1">:</span>

    <select
      name={`${namePrefix}Minute`}
      value={formData[`${namePrefix}Minute`]}
      onChange={handleChange}
      className="w-1/3 border border-gray-300 -ml-px px-2 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
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
      className="w-1/3 border border-gray-300 rounded-r-lg -ml-px px-2 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500 outline-none"
    >
      <option>AM</option>
      <option>PM</option>
    </select>
  </div>
);

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
  const [messageType, setMessageType] = useState(""); // "success" or "error"

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
      setMessage("Appointment created successfully!");
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
      setMessage("Failed to create appointment. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 sm:px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Create New Appointment
        </h2>

        {message && (
          <div
            className={`text-sm mb-4 px-3 py-2 rounded border ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FormInput
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              required={false}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormInput
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Gender & Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {["Female", "Male"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      required
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4 mr-2"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <FormInput
              label="Plate Number"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              required={false}
            />
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {/* Organization & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required={false}
            />
            <FormInput
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              required={true}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="flex items-center space-x-2">
                <TimeSelectGroup
                  formData={formData}
                  handleChange={handleChange}
                  namePrefix="start"
                />
                <span className="text-gray-500 text-sm">to</span>
                <TimeSelectGroup
                  formData={formData}
                  handleChange={handleChange}
                  namePrefix="end"
                />
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={3}
              required
              placeholder="Briefly describe the purpose of the appointment..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}

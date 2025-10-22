import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SquarePen,
  ArrowLeft,
  Trash2,
  Eye,
  Search,
  Loader2,
} from "lucide-react";
const BACKEND_URL = "http://localhost:3000/requests";
const ALL_APPOINTMENTS_ENDPOINT = `${BACKEND_URL}/all`;
const UPDATE_APPOINTMENT_ENDPOINT = `${BACKEND_URL}`;
const DELETE_APPOINTMENT_ENDPOINT = `${BACKEND_URL}`;
// NEW: Endpoint for Check-in/out status
const CHECKINOUT_ENDPOINT = "http://localhost:3000/checkinout";

const INITIAL_MOCK_APPOINTMENTS = [];

// Status mapping for the list cards
const statusStyles = {
  Approved: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Reassigned: "bg-orange-100 text-orange-800",
  // Backend status:
  Completed: "bg-yellow-100 text-yellow-800",
};

// --- TIME FORMATTING HELPER ---
/**
 * Converts a 24-hour time string ("HH:MM") to a 12-hour format ("HH:MM AM/PM").
 * Pads the hour to two digits for consistency with the form's input structure.
 * @param {string} time24 - Time string in 24-hour format (e.g., "09:00" or "14:30").
 * @returns {string} - Time string in 12-hour format (e.g., "09:00 AM" or "02:30 PM").
 */
const formatTime12Hour = (time24) => {
  if (!time24 || time24.length !== 5 || !time24.includes(":")) return time24;

  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12; // 00:00 is 12 AM
  } else if (hour > 12) {
    hour -= 12; // 13:00 is 1 PM
  }

  // Pad the hour to two digits for form consistency (e.g., "09:00 AM")
  return `${hour.toString().padStart(2, "0")}:${minute} ${period}`;
};

// --- DATA TRANSFORMATION FUNCTIONS ---

/**
 * Transforms the backend's data structure into the component's internal structure (Client-side Model).
 * @param {object} backendAppt - Appointment object from the API.
 * @returns {object} - Transformed appointment object.
 */
const transformBackendToClient = (backendAppt) => {
  // NEW: Convert time from 24h to 12h format with AM/PM
  const timeFrom12 = formatTime12Hour(backendAppt.timeFrom);
  const timeTo12 = formatTime12Hour(backendAppt.timeTo);

  // Combine timeFrom and timeTo into a single 'time' string for display
  const time = `${timeFrom12} - ${timeTo12}`;

  // Use reassignedDate/time if they exist and status is 'Rescheduled'
  const date =
    backendAppt.status === "reassigned" && backendAppt.reassignedDate
      ? backendAppt.reassignedDate
      : backendAppt.appointmentDate;

  // Also convert reassigned times to 12-hour format if they exist
  const reassignedTimeFrom12 = backendAppt.reassignedTimeFrom
    ? formatTime12Hour(backendAppt.reassignedTimeFrom)
    : null;
  const reassignedTimeTo12 = backendAppt.reassignedTimeTo
    ? formatTime12Hour(backendAppt.reassignedTimeTo)
    : null;

  const displayTime =
    backendAppt.status === "reassigned" && reassignedTimeFrom12
      ? `${reassignedTimeFrom12} - ${reassignedTimeTo12}`
      : time;

  return {
    id: backendAppt.id,
    firstName: backendAppt.customer.firstName,
    lastName: backendAppt.customer.lastName,
    email: backendAppt.customer.email,
    phoneNo: backendAppt.customer.phone, // Renamed from 'phone' to 'phoneNo'
    gender:
      backendAppt.customer.gender.charAt(0).toUpperCase() +
      backendAppt.customer.gender.slice(1), // Capitalize first letter
    country: backendAppt.customer.country,
    city: backendAppt.customer.city,
    organization: backendAppt.customer.organization,
    occupation: backendAppt.customer.occupation,
    date: date, // Using 'appointmentDate' or 'reassignedDate'
    time: displayTime, // Using combined time or reassigned time (E.g., "09:00 AM - 10:00 AM")
    status:
      backendAppt.status.charAt(0).toUpperCase() + backendAppt.status.slice(1), // Capitalize first letter for display
    purpose: backendAppt.purpose,
    plateNum: backendAppt.plateNum || "", // If null, default to blank string ""
    // REMOVED: checkInPosition: backendAppt.checkInPosition || "",
    // REMOVED: checkOutPosition: backendAppt.checkOutPosition || "",
    // originalTimeFrom/To fields removed as they are redundant when 'time' field is used for form pre-population
    // originalTimeFrom: backendAppt.timeFrom,
    // originalTimeTo: backendAppt.timeTo,
    // Store customer ID for full update payload
    customerId: backendAppt.customer.id,
  };
};

// Helper to transform the combined 'time' string into separate fields for the form
// This function needs to handle the client-side model (which has a combined 'time' field)
const prepareAppointmentForForm = (appt) => {
  // Use the time parts from the client-side model's 'time' (e.g., "04:20 PM - 06:00 PM")
  const [startTimeStr, endTimeStr] = appt.time.split(" - ");

  // Start Time: "04:20 PM" -> ["04:20", "PM"]
  const [startTime, startPeriod] = startTimeStr.split(" ");
  const [startHour, startMinute] = startTime.split(":");

  // End Time: "06:00 PM" -> ["06:00", "PM"]
  const [endTime, endPeriod] = endTimeStr.split(" ");
  const [endHour, endMinute] = endTime.split(":");

  return {
    ...appt,
    startHour: startHour,
    startMinute: startMinute,
    startPeriod: startPeriod,
    endHour: endHour,
    endMinute: endMinute,
    endPeriod: endPeriod,
    // Add a temporary state to track if the date/time fields have been modified for status 'Rescheduled'
    // For simplicity, we assume if the form is edited, it's a new proposed time.
  };
};

/**
 * Transforms the client's form data back into the backend's API structure.
 * @param {object} formData - Form data (client-side model with time parts).
 * @returns {object} - Payload for the backend update API.
 */
const prepareFormForSave = (formData) => {
  // Reconstruct time strings (e.g., "04:20 PM") - This is what the backend is now expected to handle.
  const timeFrom = `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`;
  const timeTo = `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`;

  // Get status and ensure it's lowercase for the backend
  const statusLower = formData.status.toLowerCase();

  // Determine which time/date fields to use based on status
  let updatePayload = {};

  if (statusLower === "rescheduled") {
    // If status is Rescheduled, save the new date/time as reassigned fields
    updatePayload = {
      reassignedDate: formData.date,
      reassignedTimeFrom: timeFrom,
      reassignedTimeTo: timeTo,
      appointmentDate: formData.date, // Also update original date/time to reflect the new schedule on the card
      timeFrom: timeFrom,
      timeTo: timeTo,
    };
  } else {
    // For Approved/Pending/Rejected, update the core appointment date/time
    updatePayload = {
      appointmentDate: formData.date,
      timeFrom: timeFrom,
      timeTo: timeTo,
      // Clear reassigned fields if they were set, so the card reflects the core schedule
      reassignedDate: null,
      reassignedTimeFrom: null,
      reassignedTimeTo: null,
    };
  }

  // Base request body for update
  const requestBody = {
    ...updatePayload,
    id: formData.id,
    purpose: formData.purpose,
    status: statusLower,
    plateNum: formData.plateNum, // Send plateNum back to the backend
    // Customer details update - backend needs the customer ID
    customer: {
      id: formData.customerId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phoneNo, // Use 'phone' for backend
      gender: formData.gender,
      country: formData.country,
      city: formData.city,
      organization: formData.organization,
      occupation: formData.occupation,
    },
    // NOTE: checkInPosition and checkOutPosition are not included here as they are typically captured separately at the time of the event, not via the edit form.
  };

  return requestBody;
};

// --- START: ViewAppointmentModal Component (Minor updates for time, plateNum, and new positions) ---

// Simple Close Icon
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-gray-500 hover:text-gray-900 transition-colors"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// Component to display a single label-value pair in a horizontal format (Label: Value)
// Updated to handle custom color and display blank for null/empty values
const DetailItem = ({
  label,
  value,
  colored = false,
  colorClass = "text-gray-800",
  icon: Icon,
}) => (
  <div className="flex py-2 sm:py-3 items-center gap-2">
    {Icon && (
      <Icon className={`w-5 h-5 ${colored ? colorClass : "text-gray-500"}`} />
    )}
    <div className="text-base font-bold text-gray-700 pr-4 min-w-[120px] whitespace-nowrap">
      {label}
    </div>
    <div className={`text-base ${colored ? colorClass : "text-gray-800"}`}>
      {value || ""}
    </div>
  </div>
);

// Component for the Status badge (Modal version)
const ModalStatusBadge = ({ status }) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold leading-5 capitalize";
  // Use lowercase status for style lookup since backend status is lowercase
  const colorClasses =
    statusStyles[status] ||
    statusStyles[status.toLowerCase()] ||
    "bg-gray-100 text-gray-800";

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

// NEW: Component to fetch and display the check-in/out status
const CheckInOutStatus = ({ requestId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken(); // Assuming getAuthToken is available globally

      if (!token) {
        setError("Missing authentication token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${CHECKINOUT_ENDPOINT}/${requestId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStatus(data);
      } catch (e) {
        console.error("Failed to fetch check-in/out status:", e);
        setError("Failed to load status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [requestId]);

  if (loading) {
    return (
      <div className="col-span-1 md:col-span-2 flex items-center text-sm text-gray-500 py-2 sm:py-3">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading Status...
      </div>
    );
  }

  if (error) {
    return <span className="text-sm text-red-500 py-2 sm:py-3">{error}</span>;
  }

  if (!status) {
    return (
      <span className="text-sm text-gray-500 py-2 sm:py-3">
        Status Not Found
      </span>
    );
  }

  // Determine display strings based on API response
  const checkInDisplay = status.checkedIn ? "Checked In" : "Not Checked In";
  const checkOutDisplay = status.checkedOut ? "Checked Out" : "Not Checked Out";

  // Custom DetailItem to display the fetched status
  return (
    <>
      <DetailItem
        label="Check-in Status"
        value={checkInDisplay}
        colored={true}
        colorClass={
          status.checkedIn
            ? "text-green-600 font-semibold"
            : "text-gray-500 font-medium"
        }
      />
      <DetailItem
        label="Check-out Status"
        value={checkOutDisplay}
        colored={true}
        colorClass={
          status.checkedOut
            ? "text-red-600 font-semibold"
            : "text-gray-500 font-medium"
        }
      />
    </>
  );
};

const ViewAppointmentModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const [timeFrom, timeTo] = appointment.time.split(" - ");
  // Use the appointment ID as the request ID for fetching check-in/out status
  const requestId = appointment.id;

  return (
    <div
      className="fixed inset-0  bg-gradient-to-br from-indigo-50 via-white to-purple-50 bg-opacity-75 flex items-center justify-center z-50 p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-3 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            View Appointment
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <CloseIcon />
          </button>
        </div>
        {/* Custom Dashed Separator Line to match the image */}
        <div className="mx-6 sm:mx-8 mb-4">
          <div style={{ borderTop: "2px dashed #e5e7eb" }}></div>
        </div>
        <div className="p-6 pt-0 sm:p-8 sm:pt-0 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Appointment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {/* Row 1: Name */}
            <DetailItem label="First Name" value={appointment.firstName} />
            <DetailItem label="Last Name" value={appointment.lastName} />
            {/* Row 2: Contact */}
            <DetailItem label="Email" value={appointment.email} />
            <DetailItem label="Phone No" value={appointment.phoneNo} />
            {/* Row 3: Personal */}
            <DetailItem label="Gender" value={appointment.gender} />
            <DetailItem
              label="Plate Number"
              value={appointment.plateNum}
            />{" "}
            {/* PlateNum check updated via DetailItem */}
            {/* Row 4: Location */}
            <DetailItem label="Country" value={appointment.country} />
            <DetailItem label="City" value={appointment.city} />
            {/* Row 5: Professional */}
            <DetailItem label="Organization" value={appointment.organization} />
            <DetailItem label="Occupation" value={appointment.occupation} />
            {/* Row 6: Time/Date */}
            <DetailItem label="Date" value={appointment.date} />
            <div className="flex py-2 sm:py-3"></div>{" "}
            {/* Spacer for alignment */}
            <DetailItem label="From Time" value={timeFrom.trim()} />
            <DetailItem label="To Time" value={timeTo.trim()} />
            {/* NEW: Dynamic Check-in/Check-out Status */}
            <CheckInOutStatus requestId={requestId} />
            {/* Status: Spans the full width */}
            <div className="col-span-1 md:col-span-2 py-2 sm:py-3">
              <div className="flex items-center">
                <div className="text-base font-bold text-gray-700 pr-4 min-w-[120px] whitespace-nowrap">
                  Status
                </div>
                <ModalStatusBadge status={appointment.status} />
              </div>
            </div>
          </div>
          {/* Purpose Text Area */}
          <div className="mt-8 space-y-2">
            <label className="text-base font-bold text-gray-700 block mb-2">
              Purpose
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[120px] text-gray-700">
              {appointment.purpose}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- END: ViewAppointmentModal Component ---

// --- START: Edit Appointment Form Component (Minor updates for context) ---

const EditAppointmentForm = ({ initialData, onSave, onCancel, isSaving }) => {
  // initialData is the transformed object (with startHour, etc.)
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    // Handle phoneNo specifically if you want to enforce numeric/format validation,
    // otherwise, treat all inputs the same.
    const value =
      e.target.name === "phoneNo"
        ? e.target.value.replace(/[^0-9+]/g, "") // Keep numbers and '+'
        : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use the helper function to convert form data back to the list's data structure
    const dataToSave = prepareFormForSave(formData);
    onSave(dataToSave); // Call the async save handler from the parent
  };

  return (
    <div className="bg-white w-full max-w-4xl p-6 sm:p-10 rounded-xl shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <SquarePen className="w-7 h-7 mr-3 text-indigo-600" />
          Edit Appointment
        </h2>
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
          disabled={isSaving} // Disable back button while saving
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
      >
        {/* Section 1: Client Details (Inputs unchanged) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          {/* <h3 className="md:col-span-2 text-lg font-semibold text-indigo-700 mb-2">
            Client Details
          </h3> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone No
            </label>
            <input
              type="tel"
              name="phoneNo" // Use phoneNo to match mock data key
              value={formData.phoneNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="e.g., 0912345678"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender:
            </label>
            <div className="flex space-x-6 pt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender && formData.gender === "Female"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Female</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender && formData.gender === "Male"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Male</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Context (Inputs unchanged except for new Plate Number field) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          {/* <h3 className="md:col-span-2 text-lg font-semibold text-indigo-700 mb-2">
            Context
          </h3> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            ></input>
          </div>

          {/* NEW: Plate Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number (Optional)
            </label>
            <input
              type="text"
              name="plateNum"
              value={formData.plateNum}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="e.g., AA-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Section 3: Date and Time (Inputs unchanged) */}
        <div className="md:col-span-2 border-b pb-4">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            Appointment Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            {/* Time Range (Logic unchanged) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range *
              </label>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Start Time Picker */}
                <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 flex-1 w-full sm:w-auto">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <select
                    name="startHour"
                    value={formData.startHour}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-center"
                  >
                    {[...Array(12).keys()].map((hour) => (
                      <option
                        key={hour + 1}
                        value={String(hour + 1).padStart(2, "0")}
                      >
                        {String(hour + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="mx-0.5 text-lg font-bold">:</span>
                  <select
                    name="startMinute"
                    value={formData.startMinute}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-center"
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option
                        key={minute}
                        value={String(minute).padStart(2, "0")}
                      >
                        {String(minute).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    name="startPeriod"
                    value={formData.startPeriod}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-gray-600 ml-1"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>

                <span className="self-center font-semibold text-gray-700">
                  To
                </span>

                {/* End Time Picker */}
                <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 flex-1 w-full sm:w-auto">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <select
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-center"
                  >
                    {[...Array(12).keys()].map((hour) => (
                      <option
                        key={hour + 1}
                        value={String(hour + 1).padStart(2, "0")}
                      >
                        {String(hour + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="mx-0.5 text-lg font-bold">:</span>
                  <select
                    name="endMinute"
                    value={formData.endMinute}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-center"
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option
                        key={minute}
                        value={String(minute).padStart(2, "0")}
                      >
                        {String(minute).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    name="endPeriod"
                    value={formData.endPeriod}
                    onChange={handleChange}
                    className="bg-transparent outline-none py-1 text-gray-600 ml-1"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Purpose (Input unchanged) */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            Purpose
          </h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose *
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving} // Disable while saving
            className="px-6 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 border border-gray-300 transition-all text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving} // Disable while saving
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg tracking-wide hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:bg-indigo-400 disabled:shadow-none flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Appointment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- END: Edit Appointment Form Component ---

// --- START: Main App Component (Appointment List View & State Manager) ---

// Helper function to get the token from localStorage
const getAuthToken = () => {
  try {
    // Retrieve the token stored by the AuthContext
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error retrieving token from localStorage:", error);
    return null;
  }
};

export default function App() {
  const [appointments, setAppointments] = useState(INITIAL_MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [mode, setMode] = useState("list"); // 'list' or 'edit'
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Function to fetch appointments from the backend
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    // Check if token exists before proceeding
    if (!token) {
      setLoading(false);
      setError("Authentication token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(ALL_APPOINTMENTS_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Use the token retrieved from localStorage
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Log the specific error status for better debugging
        console.error(`Fetch error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Transform backend data to client structure
      const transformedData = data.map(transformBackendToClient);
      setAppointments(transformedData);
    } catch (e) {
      console.error("Failed to fetch appointments:", e);
      setError(
        "Failed to load appointments. Please check your network or token validity."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handler to open the View modal
  const handleView = useCallback((appointmentData) => {
    setSelectedAppointment(appointmentData);
    setIsModalOpen(true);
  }, []);

  

  // Handler for when the Edit form is saved
  const handleSave = useCallback(async (updatedFormData) => {
    // 1. Transform data back to the list's original structure
    // NOTE: updatedFormData is the transformed object (with startHour, etc.) from EditAppointmentForm
    const updatedData = prepareFormForSave(updatedFormData);

    // 2. Retrieve token and check for existence
    const token = getAuthToken();
    if (!token) {
      console.error("Saving failed: Authentication token is missing.");
      alert("Saving failed: You are not authorized. Please log in again.");
      setMode("list"); // Exit edit mode
      return;
    }

    // 3. Attempt to call the API
    try {
      setSaving(true);
      const response = await fetch(
        `${UPDATE_APPOINTMENT_ENDPOINT}/${updatedData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // We send the data in the final format required by the backend
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        // Catching the "Forbidden" (403) or any other API error here
        const errorText = await response.text();
        throw new Error(
          `Update failed: ${response.statusText}. Server Response: ${errorText}`
        );
      }

      
      setAppointments((prev) =>
        prev.map((appt) => {
          if (appt.id === updatedData.id) {
            // Apply updates to the existing client-side model structure (re-transforming for consistency)
            const newClientAppt = {
              ...appt,
              // Update all fields that were editable/changed
              date: updatedData.appointmentDate,
              time: `${updatedData.timeFrom} - ${updatedData.timeTo}`,
              status:
                updatedData.status.charAt(0).toUpperCase() +
                updatedData.status.slice(1),
              purpose: updatedData.purpose,
              plateNum: updatedData.plateNum,
              firstName: updatedData.customer.firstName,
              lastName: updatedData.customer.lastName,
              email: updatedData.customer.email,
              phoneNo: updatedData.customer.phone,
              // Other customer fields...
            };
            return newClientAppt;
          }
          return appt;
        })
      );

      console.log("Update successful for appointment ID:", updatedData.id);
    } catch (error) {
      // 5. Handle any errors (including the 403 Forbidden)
      console.error("Saving failed: Error:", error.message);
      alert(
        `Saving failed: ${error.message}. Please check permissions or network.`
      );
      // Do not change mode here if update failed. User should re-try or cancel.
      return;
    } finally {
      setSaving(false);
    }

    // 6. Navigate back to the list view only after successful save
    setEditingAppointment(null);
    setMode("list");
  }, []); // Dependencies are currently empty, assuming getAuthToken/setAppointments are stable

  // Handler for canceling the Edit form
  // const handleCancel = useCallback(() => {
  //   setEditingAppointment(null);
  //   setMode("list");
  // }, []);

  // Handler to close the View modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  }, []);

  // Handler for deleting an appointment
  const handleDelete = useCallback(async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    setLoading(true);
    setError(null);
    const token = getAuthToken();

    if (!token) {
      setLoading(false);
      setError(
        "Authentication token not found. Please log in before deleting."
      );
      return;
    }

    try {
      const response = await fetch(
        `${DELETE_APPOINTMENT_ENDPOINT}/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            // Use the token retrieved from localStorage
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      // Update the state immediately
      setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    } catch (e) {
      console.error("Deletion failed:", e);
      setError(`Failed to delete appointment: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    // Ensure app.status is available and convert filter to match client-side model (capitalized)
    const statusLower = app.status ? app.status.toLowerCase() : "";
    const filterLower = statusFilter ? statusFilter.toLowerCase() : "";

    const matchesStatus = !statusFilter || statusLower === filterLower;
    const matchesDate = !dateFilter || app.date === dateFilter;
    const matchesSearch =
      !searchTerm ||
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesDate && matchesSearch;
  });

  // RENDER the Appointment List View
  if (mode === "list") {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Status Filter */}
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-auto focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>

          {/* Date Filter */}
          <div className="relative w-full md:w-auto">
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-20 bg-white rounded-xl shadow-md">
            <Loader2 className="w-8 h-8 mr-3 text-indigo-600 animate-spin" />
            <p className="text-xl text-gray-600">Loading Appointments...</p>
          </div>
        ) : (
          /* Appointment Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white shadow-xl rounded-xl p-6 relative transition duration-300 hover:shadow-2xl"
                >
                  {/* Action Icons */}
                  <div className="absolute top-4 right-4 flex gap-3 text-lg">
                    {/* VIEW BUTTON */}
                    <button
                      title="View Details"
                      onClick={() => handleView(app)}
                      className="p-1 rounded-full hover:bg-blue-50 transition duration-150"
                    >
                      <Eye className="text-blue-500 hover:text-blue-600 w-5 h-5" />
                    </button>
                   
                    {/* DELETE BUTTON */}
                    <button
                      title="Delete"
                      onClick={() => handleDelete(app.id)}
                      className="p-1 rounded-full hover:bg-red-50 transition duration-150"
                    >
                      <Trash2 className="text-red-500 hover:text-red-600 w-5 h-5" />
                    </button>
                  </div>

                  {/* Name and Status */}
                  <div className="mb-3">
                    <h2 className="text-xl font-bold text-gray-800">
                      {app.firstName} {app.lastName}
                    </h2>
                    {/* Use lowercase status for style lookup */}
                    <span
                      className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        statusStyles[app.status] ||
                        statusStyles[app.status.toLowerCase()]
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Appointment Info */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <span className="font-semibold w-20">Date:</span>{" "}
                      {app.date}
                    </p>
                    {/* UPDATED: Display From and To times (includes AM/PM via app.time) */}
                    <p className="flex items-center">
                      <span className="font-semibold w-20">From:</span>{" "}
                      {app.time.split(" - ")[0].trim()}
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-20">To:</span>{" "}
                      {app.time.split(" - ")[1].trim()}
                    </p>
                    {/* End of UPDATED time block */}
                    <p className="flex items-center">
                      <span className="font-semibold w-20">Phone:</span>{" "}
                      {app.phoneNo}
                    </p>
                    <p className="flex items-center truncate">
                      <span className="font-semibold w-20">Email:</span>{" "}
                      {app.email}
                    </p>
                  </div>

                  {/* Divider at Bottom */}
                  <hr className="mt-4 border-gray-100" />
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-lg p-10 bg-white rounded-xl shadow-md">
                No appointments found matching the current filters.
              </p>
            )}
          </div>
        )}

        {/* RENDER MODAL CONDITIONALLY */}
        {isModalOpen && (
          <ViewAppointmentModal
            appointment={selectedAppointment}
            onClose={handleCloseModal}
          />
        )}
      </div>
    );
  }

  
}

import React, { useState, useEffect, useCallback } from "react";
// Using lucide-react icons for all components (replacing react-icons/fa)
import { Clock, SquarePen, ArrowLeft, Trash2, Eye, Search } from "lucide-react";

// --- START: Detailed Mock Data (Used for both list and modal) ---

// NOTE: Renamed to match the local state in App.js
const INITIAL_MOCK_APPOINTMENTS = [
  {
    id: 1,
    firstName: "Lidiya",
    lastName: "Fiker",
    email: "lidiya@gmail.com",
    phoneNo: "0912342676",
    gender: "Female",
    country: "Ethiopia",
    city: "Addis Abeba",
    organization: "Addis Aba Group",
    occupation: "Financial Analyst",
    date: "2023-06-10", // YYYY-MM-DD format for date input compatibility
    time: "04:20 PM - 06:00 PM",
    status: "Approved",
    purpose:
      "Discussing the latest quarterly earnings report and market performance metrics. Need to finalize budget proposals.",
  },
  {
    id: 2,
    firstName: "Tsedi",
    lastName: "Kibret",
    email: "tsedi@gmail.com",
    phoneNo: "0944717988",
    gender: "Male",
    country: "Ethiopia",
    city: "Gonder",
    organization: "Tech Solutions PLC",
    occupation: "Software Engineer",
    date: "2023-07-20",
    time: "08:00 AM - 09:00 AM",
    status: "Pending",
    purpose:
      "Reviewing system architecture documentation and planning the next sprint goals.",
  },
  {
    id: 3,
    firstName: "Abebe",
    lastName: "Bikila",
    email: "abebe@example.com",
    phoneNo: "0911223344",
    gender: "Male",
    country: "Ethiopia",
    city: "Addis Abeba",
    organization: "Health First Clinic",
    occupation: "Physician",
    date: "2023-08-05",
    time: "10:30 AM - 11:30 AM",
    status: "Rejected",
    purpose:
      "Initial consultation for a new wellness program partnership. Requires re-evaluation of schedule.",
  },
];

// --- END: Detailed Mock Data ---

// Status mapping for the list cards
const statusStyles = {
  Approved: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Rescheduled: "bg-orange-100 text-orange-800",
};

// --- DATA TRANSFORMATION FUNCTIONS ---
// Helper to transform the combined 'time' string into separate fields for the form
const prepareAppointmentForForm = (appt) => {
  // Example: "04:20 PM - 06:00 PM"
  const [startTimeStr, endTimeStr] = appt.time.split(" - ");

  // Start Time: "04:20 PM" -> ["04:20", "PM"] -> ["04", "20"]
  const [startTime, startPeriod] = startTimeStr.split(" ");
  const [startHour, startMinute] = startTime.split(":");

  // End Time: "06:00 PM" -> ["06:00", "PM"] -> ["06", "00"]
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
  };
};

// Helper to transform the separate form fields back into the combined 'time' string for saving
const prepareFormForSave = (formData) => {
  // Reconstruct time string (e.g., "04:20 PM - 06:00 PM")
  const startTime = `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`;
  const endTime = `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`;
  const time = `${startTime} - ${endTime}`;

  // Remove temporary time properties used only for the form's UI
  const {
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
    ...rest
  } = formData;

  return {
    ...rest,
    time,
  };
};

// --- START: ViewAppointmentModal Component ---
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
        <path d="M18 6L6 18M6 6l12 12" /> {" "}
  </svg>
);

// Component to display a single label-value pair in a horizontal format (Label: Value)
const DetailItem = ({ label, value }) => (
  <div className="flex py-2 sm:py-3">
       {" "}
    <div className="text-base font-bold text-gray-700 pr-4 min-w-[120px] whitespace-nowrap">
            {label}     {" "}
    </div>
        <div className="text-base text-gray-800">{value}</div> {" "}
  </div>
);

// Component for the Status badge (Modal version)
const ModalStatusBadge = ({ status }) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold leading-5 capitalize";
  let colorClasses = statusStyles[status] || "bg-gray-100 text-gray-800";

  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const ViewAppointmentModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 font-sans"
      onClick={onClose}
    >
           {" "}
      <div
        className="w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
                {/* Modal Header */}       {" "}
        <div className="p-6 sm:p-8 pb-3 flex justify-between items-center">
                   {" "}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        View Appointment          {" "}
          </h2>
                   {" "}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
                        <CloseIcon />         {" "}
          </button>
                 {" "}
        </div>
                {/* Custom Dashed Separator Line to match the image */}       {" "}
        <div className="mx-6 sm:mx-8 mb-4">
                    <div style={{ borderTop: "2px dashed #e5e7eb" }}></div>     
           {" "}
        </div>
               {" "}
        <div className="p-6 pt-0 sm:p-8 sm:pt-0 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Appointment Details Grid */}         {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        {/* Row 1: Name */}
                       {" "}
            <DetailItem label="First Name" value={appointment.firstName} />
                       {" "}
            <DetailItem label="Last Name" value={appointment.lastName} />       
                {/* Row 2: Contact */}
                        <DetailItem label="Email" value={appointment.email} />
                       {" "}
            <DetailItem label="Phone No" value={appointment.phoneNo} />         
              {/* Row 3: Personal */}
                        <DetailItem label="Gender" value={appointment.gender} />
                        <div className="flex py-2 sm:py-3"></div> {/* Spacer */}
                        {/* Row 4: Location */}
                       {" "}
            <DetailItem label="Country" value={appointment.country} />
                        <DetailItem label="City" value={appointment.city} />   
                    {/* Row 5: Professional */}
                       {" "}
            <DetailItem label="Organization" value={appointment.organization} />
                       {" "}
            <DetailItem label="Occupation" value={appointment.occupation} />   
                    {/* Row 6: Time/Date */}
                        <DetailItem label="Date" value={appointment.date} />
                        <DetailItem label="Time" value={appointment.time} />   
                    {/* Status: Spans the full width */}           {" "}
            <div className="col-span-1 md:col-span-2 py-2 sm:py-3">
                           {" "}
              <div className="flex items-center">
                               {" "}
                <div className="text-base font-bold text-gray-700 pr-4 min-w-[120px] whitespace-nowrap">
                                    Status                {" "}
                </div>
                                <ModalStatusBadge status={appointment.status} />
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Purpose Text Area */}         {" "}
          <div className="mt-8 space-y-2">
                       {" "}
            <label className="text-base font-bold text-gray-700 block mb-2">
                            Purpose            {" "}
            </label>
                       {" "}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[120px] text-gray-700">
                            {appointment.purpose}           {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

// --- END: ViewAppointmentModal Component ---

// --- START: Edit Appointment Form Component ---

const EditAppointmentForm = ({ initialData, onSave, onCancel }) => {
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
    onSave(dataToSave);
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
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Modifying Appointment ID: **{formData.id}**
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
      >
        {/* Section 1: Client Details */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          <h3 className="md:col-span-2 text-lg font-semibold text-indigo-700 mb-2">
            Client Details
          </h3>

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
                  checked={formData.gender === "Female"}
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
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">Male</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Context */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
          <h3 className="md:col-span-2 text-lg font-semibold text-indigo-700 mb-2">
            Context
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="Ethiopia">Ethiopia</option>
              <option value="Kenya">Kenya</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="Addis Abeba">Addis Abeba</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Washington">Washington D.C.</option>
              <option value="London">London</option>
              <option value="Gonder">Gonder</option>
            </select>
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

        {/* Section 3: Date and Time */}
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

            {/* Status */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>

            {/* Time Range */}
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

        {/* Section 4: Purpose */}
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
            className="px-6 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 border border-gray-300 transition-all text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg tracking-wide hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Update Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

// --- END: Edit Appointment Form Component ---

// --- START: Main App Component (Appointment List View & State Manager) ---

export default function App() {
  const [appointments, setAppointments] = useState(INITIAL_MOCK_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // NEW STATE: Manages the current screen mode ('list' or 'edit')

  const [mode, setMode] = useState("list"); // 'list' or 'edit'
  const [editingAppointment, setEditingAppointment] = useState(null); // Data for the edit form // State for the View Modal (kept from previous code)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Handler to open the View modal

  const handleView = useCallback((appointmentData) => {
    setSelectedAppointment(appointmentData);
    setIsModalOpen(true);
  }, []);

  // Handler to open the Edit form
  const handleEdit = useCallback((appointmentData) => {
    // 1. Transform the data structure for the form component
    const transformedData = prepareAppointmentForForm(appointmentData);

    // 2. Set the data and switch the mode
    setEditingAppointment(transformedData);
    setMode("edit");

    // Close modal if open
    setIsModalOpen(false);
  }, []);

  // Handler for when the Edit form is saved
  const handleSave = useCallback((updatedFormData) => {
    // 1. Transform data back to the list's original structure
    const updatedData = prepareFormForSave(updatedFormData);

    // 2. Update the appointment list in state
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === updatedData.id ? updatedData : appt))
    );

    console.log("Saving updated appointment:", updatedData);

    // 3. Navigate back to the list view
    setEditingAppointment(null);
    setMode("list");
  }, []);

  // Handler for canceling the Edit form
  const handleCancel = useCallback(() => {
    setEditingAppointment(null);
    setMode("list");
  }, []); // Handler to close the View modal (kept from previous code)

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
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
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Appointment Dashboard
        </h1>

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
            {/* Replaced FaSearch with Lucide Search */}
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

        {/* Appointment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-white shadow-xl rounded-xl p-6 relative transition duration-300 hover:shadow-2xl"
              >
                {/* Action Icons */}
                <div className="absolute top-4 right-4 flex gap-3 text-lg">
                  {/* VIEW BUTTON - Replaced FaEye with Lucide Eye */}
                  <button
                    title="View Details"
                    onClick={() => handleView(app)}
                    className="p-1 rounded-full hover:bg-blue-50 transition duration-150"
                  >
                    <Eye className="text-blue-500 hover:text-blue-600 w-5 h-5" />
                  </button>
                  {/* EDIT BUTTON - Replaced FaEdit with Lucide SquarePen */}
                  <button
                    title="Edit"
                    onClick={() => handleEdit(app)}
                    className="p-1 rounded-full hover:bg-indigo-50 transition duration-150"
                  >
                    <SquarePen className="text-indigo-600 hover:text-indigo-700 w-5 h-5" />
                  </button>
                  {/* DELETE BUTTON - Replaced FaTrash with Lucide Trash2 */}
                  <button
                    title="Delete"
                    onClick={() => console.log("Deleting:", app.id)}
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
                  <span
                    className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                      statusStyles[app.status]
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                {/* Appointment Info */}
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="font-semibold w-20">Date:</span> {app.date}
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold w-20">Time:</span>{" "}
                    {app.time.split("-")[0].trim()}
                  </p>
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

  // RENDER the Edit Appointment Form View
  if (mode === "edit" && editingAppointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8 font-sans w-full">
        <EditAppointmentForm
          initialData={editingAppointment}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }
}

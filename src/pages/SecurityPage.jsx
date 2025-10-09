import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaCheckSquare,
  FaRegSquare,
} from "react-icons/fa";

// --- Sample Data (Mocked) ---
const mockSecurityAppointments = [
  {
    no: "00001",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Mobile,Document",
    securityCheck: "NO",
    securityPass: false,
    checkOut: false,
  },
  {
    no: "00002",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Document",
    securityCheck: "NO",
    securityPass: true,
    checkOut: false,
  },
  {
    no: "00003",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "PC,Mobile",
    securityCheck: "YES",
    securityPass: false,
    checkOut: false,
  },
  {
    no: "00004",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Document",
    securityCheck: "YES",
    securityPass: false,
    checkOut: false,
  },
  {
    no: "00005",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Mobile",
    securityCheck: "YES",
    securityPass: true,
    checkOut: false,
  },
  {
    no: "00006",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Document",
    securityCheck: "NO",
    securityPass: false,
    checkOut: false,
  },
  {
    no: "00007",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Mobile,PC",
    securityCheck: "YES",
    securityPass: false,
    checkOut: false,
  },
  {
    no: "00008",
    name: "Christine Brooks",
    date: "04 Sep 2019",
    phone: "0944725108",
    allowedMaterial: "Document",
    securityCheck: "NO",
    securityPass: false,
    checkOut: false,
  },
  // Adding more entries for better pagination demo
  ...Array(20)
    .fill()
    .map((_, i) => ({
      no: `000${i + 9}`,
      name: `Visitor ${i + 9}`,
      date: "05 Sep 2019",
      phone: "0900000000",
      allowedMaterial: i % 2 === 0 ? "Mobile" : "Document",
      securityCheck: i % 3 === 0 ? "YES" : "NO",
      securityPass: i % 4 === 0,
      checkOut: i % 5 === 0,
    })),
];

// --- SecurityRow Component (Inner) ---
const SecurityRow = ({ appointment }) => {
  const {
    no,
    name,
    date,
    phone,
    allowedMaterial,
    securityCheck,
    securityPass,
    checkOut,
  } = appointment;

  // Render a custom checkbox using icons
  const Checkbox = ({ isChecked }) => {
    return (
      <span className="flex items-center justify-center text-xl">
        {isChecked ? (
          <FaCheckSquare className="text-blue-500" />
        ) : (
          <FaRegSquare className="text-gray-300" />
        )}
      </span>
    );
  };

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="p-4 text-sm text-gray-500">{no}</td>
      <td className="p-4 text-sm font-semibold text-gray-800">{name}</td>
      <td className="p-4 text-sm text-gray-700">{date}</td>
      <td className="p-4 text-sm text-gray-700">{phone}</td>
      <td className="p-4 text-sm text-gray-700">{allowedMaterial}</td>
      <td className="p-4 text-sm text-gray-700 text-center">{securityCheck}</td>
      <td className="p-4 text-center">
        <Checkbox isChecked={securityPass} />
      </td>
      <td className="p-4 text-center">
        <Checkbox isChecked={checkOut} />
      </td>
    </tr>
  );
};

// --- SecurityPage Component (Main) ---
const SecurityPage = () => {
  const [appointments] = useState(mockSecurityAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 8; // Based on the mock-up's pagination

  // --- Search Filtering Logic ---
  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return appointments.filter((appointment) =>
      Object.values(appointment).some((value) =>
        String(value).toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [appointments, searchTerm]);

  // --- Pagination Logic ---
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7; // Number of page buttons to show at most
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust start/end to always show maxPagesToShow if possible
    if (currentPage < 3) endPage = Math.min(totalPages, maxPagesToShow - 2);
    if (currentPage > totalPages - 2)
      startPage = Math.max(1, totalPages - maxPagesToShow + 3);

    // Add '1' and '...' if necessary at the beginning
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }

    // Add the core page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i > 0 && i <= totalPages) pageNumbers.push(i);
    }

    // Add '...' and 'totalPages' if necessary at the end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    // Outer container for the page background
    <div className="bg-gray-50 min-h-screen p-10">
      {/* Main Card Container */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6 md:p-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Appointments
        </h1>

        {/* Header/Controls Row */}
        <div className="flex justify-between items-center mb-6">
          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm hover:bg-gray-50 transition">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            <span className="font-medium">Date</span>
          </button>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "No",
                  "NAME",
                  "DATE",
                  "Phone No",
                  "Allowed Material",
                  "Security Check",
                  "Security Pass",
                  "Check Out",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentAppointments.length > 0 ? (
                currentAppointments.map((appointment, index) => (
                  // Ensure a unique key for each row
                  <SecurityRow
                    key={appointment.no + "-" + index}
                    appointment={appointment}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &larr; Previous
          </button>

          <div className="flex space-x-2">
            {getPaginationNumbers().map((number, index) => (
              <span
                key={index}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all duration-200 ${
                  number === "..."
                    ? "text-gray-400 cursor-default"
                    : number === currentPage
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                }`}
                onClick={() =>
                  typeof number === "number" && setCurrentPage(number)
                }
              >
                {number}
              </span>
            ))}
          </div>

          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;

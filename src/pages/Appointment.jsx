import React, { useState, useMemo } from "react";
// Added ChevronLeft and ChevronRight for Pagination buttons
import {
  Search,
  Eye,
  X,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Mock Data — Includes 15 items to demonstrate pagination
 */
const mockAppointments = [
  {
    id: 1,
    name: "Christine B.",
    email: "lidu@gmail.com",
    date: "2025-10-05",
    status: "Reassigned",
    checkin: "",
    checkout: "",
    reason: "Client requested a reschedule.",
  },
  {
    id: 2,
    name: "Abraham N.",
    email: "abraham@company.com",
    date: "2025-10-07",
    status: "Approved",
    checkin: "Checked In",
    checkout: "Checked Out",
    reason: "Standard quarterly review.",
  },
  {
    id: 3,
    name: "Tsedey M.",
    email: "tsed@gmail.com",
    date: "2025-10-03",
    status: "Rejected",
    checkin: "",
    checkout: "",
    reason: "Date conflicted with VIP meeting.",
  },
  {
    id: 4,
    name: "Maria S.",
    email: "maria@test.com",
    date: "2025-10-06",
    status: "Approved",
    checkin: "Checked In",
    checkout: "",
    reason: "Follow-up discussion.",
  },
  {
    id: 5,
    name: "David L.",
    email: "david@corp.net",
    date: "2025-10-08",
    status: "Approved",
    checkin: "Checked In",
    checkout: "Checked Out",
    reason: "Project sign-off.",
  },
  {
    id: 6,
    name: "Fatima A.",
    email: "fatima@web.org",
    date: "2025-10-09",
    status: "Reassigned",
    checkin: "",
    checkout: "",
    reason: "Internal staff meeting moved.",
  },
  {
    id: 7,
    name: "John P.",
    email: "john@mail.co",
    date: "2025-10-04",
    status: "Approved",
    checkin: "Checked In",
    checkout: "Checked Out",
    reason: "Budget finalization.",
  },
  {
    id: 8,
    name: "Sarah K.",
    email: "sarah@home.com",
    date: "2025-10-10",
    status: "Rejected",
    checkin: "",
    checkout: "",
    reason: "No availability on requested day.",
  },
  {
    id: 9,
    name: "Elena V.",
    email: "elena@biz.com",
    date: "2025-10-11",
    status: "Approved",
    checkin: "Checked In",
    checkout: "",
    reason: "Onboarding session.",
  },
  {
    id: 10,
    name: "Robert H.",
    email: "robert@mail.com",
    date: "2025-10-12",
    status: "Approved",
    checkin: "Checked In",
    checkout: "Checked Out",
    reason: "Quarterly check-in.",
  },
  {
    id: 11,
    name: "Lucy J.",
    email: "lucy@global.net",
    date: "2025-10-13",
    status: "Approved",
    checkin: "Checked In",
    checkout: "",
    reason: "Strategy planning.",
  },
  {
    id: 12,
    name: "Omar Z.",
    email: "omar@sales.co",
    date: "2025-10-14",
    status: "Reassigned",
    checkin: "",
    checkout: "",
    reason: "Team conflict.",
  },
  {
    id: 13,
    name: "Karen B.",
    email: "karen@tech.org",
    date: "2025-10-15",
    status: "Approved",
    checkin: "Checked In",
    checkout: "Checked Out",
    reason: "Technical review.",
  },
  {
    id: 14,
    name: "Michael T.",
    email: "mike@corp.com",
    date: "2025-10-16",
    status: "Approved",
    checkin: "Checked In",
    checkout: "",
    reason: "Launch preparation.",
  },
  {
    id: 15,
    name: "Zoe C.",
    email: "zoe@app.dev",
    date: "2025-10-17",
    status: "Rejected",
    checkin: "",
    checkout: "",
    reason: "Incorrect submission form.",
  },
];

const statusColors = {
  Approved: "bg-blue-500 text-white",
  Reassigned: "bg-yellow-400 text-black",
  Rejected: "bg-red-500 text-white",
};

// Helper component for cleaner detail presentation
const DetailItem = ({ label, value, color = "text-gray-800" }) => (
  <div className="flex flex-col">
    <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
    <p className={`mt-0.5 text-sm font-semibold ${color}`}>{value}</p>
  </div>
);

// Helper function to render table status text
const renderCheckStatus = (value, status) => {
  // Check if the string is exactly "Checked In" or "Checked Out"
  if (value.includes("Checked")) {
    return value;
  }
  return "—";
};

/**
 * AppointmentRequests — main component
 */
export default function AppointmentRequests({ userRole = "viewer" }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // 🆕 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Display 8 rows per page

  const hasAccess = ["admin", "ceo", "manager", "viewer"].includes(userRole);
  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-medium">
        Unauthorized access
      </div>
    );
  }

  // Optimized search, filter, AND pagination
  const { filteredAndPaged, totalPages, totalFilteredCount } = useMemo(() => {
    // 1. Filter the entire dataset
    const filtered = mockAppointments.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());

      const matchStatus = filterStatus ? a.status === filterStatus : true;
      const matchDate = filterDate ? a.date === filterDate : true;

      return matchSearch && matchStatus && matchDate;
    });

    const count = filtered.length;
    const pages = Math.ceil(count / itemsPerPage);

    // Ensure currentPage is valid after filter changes
    const validCurrentPage = Math.min(currentPage, pages || 1);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }

    // 2. Apply Pagination
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const filteredAndPaged = filtered.slice(startIndex, endIndex);

    return { filteredAndPaged, totalPages: pages, totalFilteredCount: count };
  }, [search, filterStatus, filterDate, currentPage]); // Dependency array includes currentPage

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // 🆕 PAGINATION HANDLERS
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper to generate a basic page list (e.g., [1, 2, 3, ..., 10])
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Basic logic for showing current page + 2 surrounding pages, plus ellipsis and ends
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }
    return [...new Set(pages)]; // Use Set to remove potential duplicates from logic
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Appointment Requests
        </h2>
        {userRole !== "viewer" && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center">
            <Plus size={18} className="mr-1" /> New Appointment
          </button>
        )}
      </div>

      {/* 🔹 Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex items-center bg-white px-3 py-2 rounded-lg border w-full sm:w-80 shadow-sm">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search by name or email"
            className="outline-none w-full text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-4 py-2 bg-white text-gray-700 shadow-sm appearance-none focus:ring-blue-500 focus:border-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Reassigned</option>
        </select>

        <div className="flex items-center space-x-2 border rounded-lg px-3 py-2 bg-white shadow-sm">
          <CalendarDays size={18} className="text-gray-400" />
          <input
            type="date"
            className="text-gray-700 focus:outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="text-xs uppercase bg-gray-50 text-gray-800 font-semibold border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndPaged.length > 0 ? (
              filteredAndPaged.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Calculate absolute index for 'No' column */}
                  <td className="px-4 py-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-green-600 text-sm font-medium">
                    {renderCheckStatus(item.checkin, "Checked In")}
                  </td>
                  <td className="px-4 py-3 text-red-500 text-sm font-medium">
                    {renderCheckStatus(item.checkout, "Checked Out")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Eye
                      size={18}
                      className="text-gray-500 hover:text-blue-500 cursor-pointer inline"
                      onClick={() => setSelected(item)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 py-10 italic"
                >
                  No appointments found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🆕 PAGINATION FOOTER */}
        {totalFilteredCount > itemsPerPage && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            {/* Page Numbers */}
            <nav className="flex space-x-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && goToPage(page)}
                  disabled={page === "..."}
                  className={`w-9 h-9 flex items-center justify-center text-sm rounded-full transition duration-150 ${
                    page === "..."
                      ? "text-gray-500"
                      : currentPage === page
                      ? "bg-gray-700 text-white font-semibold"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* 🔹 SLIDE-OVER DRAWER (Details Panel) - Unchanged */}
      {/* ... (Modal/Drawer code omitted for brevity) ... */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          selected ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!selected}
        onClick={() => setSelected(null)}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            selected ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selected && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-700"
                  onClick={() => setSelected(null)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Current Status
                    </p>
                    <span
                      className={`px-4 py-1 mt-1 inline-flex rounded-full text-sm font-bold ${
                        statusColors[selected.status]
                      }`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 grid grid-cols-2 gap-4">
                    <DetailItem label="Client Name" value={selected.name} />
                    <DetailItem label="Email" value={selected.email} />
                    <DetailItem
                      label="Scheduled Date"
                      value={formatDate(selected.date)}
                    />
                    <DetailItem
                      label="Check In"
                      value={renderCheckStatus(selected.checkin, "Checked In")}
                      color="text-green-600"
                    />
                    <DetailItem
                      label="Check Out"
                      value={renderCheckStatus(
                        selected.checkout,
                        "Checked Out"
                      )}
                      color="text-red-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Reason/Notes
                    </p>
                    <p className="text-gray-800 bg-white p-3 rounded-lg border text-sm italic">
                      {selected.reason || "No specific reason provided."}
                    </p>
                  </div>
                </div>
              </div>

             
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

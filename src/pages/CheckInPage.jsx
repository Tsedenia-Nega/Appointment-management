import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  AlertTriangle,
  Info,
  Gavel,
  Check,
  Package,
  Search,
  Calendar,
} from "lucide-react";

const BASE_URL = "http://localhost:3000";
const ACCESS_TOKEN_KEY = "token";

const formatTime = (timeString) => {
  if (!timeString) return "-";
  try {
    const [hour, minute] = timeString.split(":").map(Number);
    const date = new Date(0, 0, 0, hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
};

const StatusCheckbox = ({ id, label, checked, onChange, disabled }) => (
  <label
    htmlFor={id}
    className={`flex items-center space-x-2 cursor-pointer transition-transform duration-200 ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
    }`}
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="hidden"
    />
    <div
      className={`w-5 h-5 flex items-center justify-center rounded-md border-2 
      ${
        checked
          ? "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 shadow-lg shadow-blue-400/50"
          : "bg-white border-gray-300"
      } 
      ${!disabled && "transition-all duration-300"}`}
    >
      {checked && <Check size={14} className="text-white animate-pulse" />}
    </div>
    <span
      className={`text-sm font-medium ${
        checked ? "text-blue-700" : "text-gray-700"
      }`}
    >
      {label}
    </span>
  </label>
);

const MaterialsModal = ({ isOpen, onClose, materials = [], customerName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-full bg-blue-100 shadow-md">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Allowed Materials
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Full list of approved materials for **{customerName}**.
        </p>
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {materials.length > 0 ? (
            materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center bg-white/80 px-3 py-2 rounded-xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
              >
                <Check
                  size={14}
                  className="text-green-500 mr-2 flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-700">
                  {material}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-sm">
              No materials were specifically approved.
            </p>
          )}
        </div>
        <div className="mt-6 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-white border border-gray-300 shadow hover:shadow-lg hover:bg-gray-50 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SecretaryCheckInPage() {
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMaterials, setModalMaterials] = useState([]);
  const [modalCustomerName, setModalCustomerName] = useState("");

  const token = useMemo(() => localStorage.getItem(ACCESS_TOKEN_KEY), []);
  const showToast = (message, type) => setToast({ message, type });
  const openMaterialsModal = (materials, customerName) => {
    setModalMaterials(materials);
    setModalCustomerName(customerName);
    setIsModalOpen(true);
  };
  const closeMaterialsModal = () => {
    setIsModalOpen(false);
    setModalMaterials([]);
    setModalCustomerName("");
  };

  const fetchCheckInOutStatus = async (requestId) => {
    try {
      const res = await fetch(`${BASE_URL}/checkinout/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok)
        return { securityPassed: false, checkedIn: false, checkedOut: false };
      const data = await res.json();
      return {
        securityPassed: data.securityPassed || false,
        checkedIn: data.checkedIn || false,
        checkedOut: data.checkedOut || false,
      };
    } catch {
      return { securityPassed: false, checkedIn: false, checkedOut: false };
    }
  };

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setFetchError("Authentication token not found.");
      setIsListLoading(false);
      return;
    }
    setIsListLoading(true);
    setFetchError(null);

    try {
      const [approvedRes, reassignedRes] = await Promise.all([
        fetch(`${BASE_URL}/requests/approved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/requests/reassigned`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const approvedData = approvedRes.ok ? await approvedRes.json() : [];
      const reassignedData = reassignedRes.ok ? await reassignedRes.json() : [];

      const combined = new Map();
      [...approvedData, ...reassignedData].forEach((a) =>
        combined.set(a.id, a)
      );
      const enriched = Array.from(combined.values());
      const statuses = await Promise.all(
        enriched.map((a) => fetchCheckInOutStatus(a.id))
      );

      setAllAppointments(
        enriched.map((appt, i) => ({
          ...appt,
          ...statuses[i],
          inspectionRequired: appt.approval?.inspectionRequired ?? false,
          allowedMaterials: appt.approval?.allowedMaterials ?? [],
        }))
      );
    } catch (err) {
      setFetchError(
        err.message ||
          "An unexpected error occurred while fetching appointments."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCheckInToggle = async (apptId, currentStatus) => {
    if (currentStatus || actionLoading) return;
    setActionLoading(apptId);
    try {
      await fetch(`${BASE_URL}/checkinout/${apptId}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checkedIn: true }),
      });
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, checkedIn: true } : a))
      );
    } catch (err) {
      showToast(
        `Error recording check-in: ${err.message || "Check console."}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = useMemo(
    () =>
      allAppointments.filter((appt) => {
        const name =
          `${appt.customer?.firstName} ${appt.customer?.lastName}`.toLowerCase();
        const term = searchTerm.toLowerCase();
        const nameMatch = name.includes(term);
        const dateMatch = filterDate
          ? appt.appointmentDate === filterDate
          : true;
        return nameMatch && dateMatch;
      }),
    [allAppointments, searchTerm, filterDate]
  );

  const SecurityStatusBadge = ({ securityPassed }) =>
    securityPassed ? (
      <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800 rounded-full shadow-lg shadow-blue-400/50 animate-pulse">
        <Check size={12} className="mr-1" /> YES
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-200 to-red-400 text-red-800 rounded-full shadow-lg shadow-red-400/50 animate-pulse">
        <X size={12} className="mr-1" /> NO
      </span>
    );

  return (
    <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-white to-purple-50  md:p-4">
      {/* Filter Section */}
      {/* --- Filter Section --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-2 bg-white/30 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-200">
        {/* Name/Search Filter */}
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-blue-500"
          />
          <input
            type="text"
            placeholder="Filter by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-300 shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-300 placeholder-gray-400 text-gray-900 transition-all duration-300 hover:shadow-lg"
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full md:w-60">
          <Calendar
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-300 shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300"
          />
        </div>

        {/* Clear Filter Button */}
        {(searchTerm || filterDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterDate("");
            }}
            className="md:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-2xl shadow-md hover:shadow-lg hover:bg-red-200 transition duration-300"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>

        <div className="relative w-full md:w-60">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>

        {(searchTerm || filterDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterDate("");
            }}
            className="md:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-xl hover:bg-red-200 shadow-md hover:shadow-lg transition duration-200"
          >
            Clear Filters
          </button>
        )}
      </div> */}

      {/* Toast/Error Messages */}
      {fetchError && (
        <div className="p-4 mb-4 text-sm rounded-xl flex items-center text-red-800 bg-red-100 shadow-md">
          <AlertTriangle size={20} className="mr-2" />
          {fetchError}
          <button
            onClick={() => setFetchError(null)}
            className="ml-auto text-current hover:opacity-75"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {toast.message && toast.type === "error" && (
        <div className="p-4 mb-4 text-sm rounded-xl flex items-center text-red-800 bg-red-100 shadow-md">
          <AlertTriangle size={20} className="mr-2" />
          {toast.message}
          <button
            onClick={() => setToast({ message: "", type: "info" })}
            className="ml-auto text-current hover:opacity-75"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isListLoading ? (
        <div className="text-center p-10 text-gray-600 flex items-center justify-center">
          <Loader2 size={24} className="mr-2 animate-spin" /> Loading approved
          appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg">
          <Info size={30} className="mx-auto mb-3 text-gray-400" />
          <p>No appointments available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-white">
              <tr>
                {[
                  "No",
                  "Name",
                  "Time Slot",
                  "Date",
                  "Inspection Req.",
                  "Materials",
                  "Security",
                  "Check-in",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((appt, i) => {
                const customerName = `${appt.customer?.firstName} ${appt.customer?.lastName}`;
                const materialsCount = appt.allowedMaterials.length;

                return (
                  <tr
                    key={appt.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-white transition-all duration-300"
                  >
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {customerName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatTime(appt.timeFrom)} - {formatTime(appt.timeTo)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {appt.appointmentDate}
                    </td>
                    <td className="px-4 py-3">
                      {appt.inspectionRequired ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-200 to-red-400 text-red-800 rounded-full shadow-lg shadow-red-400/50 animate-pulse">
                          <Gavel size={12} className="mr-1" /> YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gradient-to-r from-green-200 to-green-400 text-green-800 rounded-full shadow-lg shadow-green-400/50 animate-pulse">
                          <Check size={12} className="mr-1" /> NO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {materialsCount > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-xl shadow-sm">
                            {appt.allowedMaterials[0]}
                          </span>
                          {materialsCount > 1 && (
                            <button
                              onClick={() =>
                                openMaterialsModal(
                                  appt.allowedMaterials,
                                  customerName
                                )
                              }
                              className="px-2 py-0.5 text-xs font-semibold bg-gray-500 text-white rounded-xl shadow-sm hover:shadow-lg hover:bg-gray-600 transition duration-200"
                            >
                              +{materialsCount - 1} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <SecurityStatusBadge
                        securityPassed={appt.securityPassed}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusCheckbox
                        id={`checkin-${appt.id}`}
                        label="Check-in"
                        checked={appt.checkedIn}
                        onChange={() =>
                          handleCheckInToggle(appt.id, appt.checkedIn)
                        }
                        disabled={actionLoading === appt.id || appt.checkedIn}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <MaterialsModal
        isOpen={isModalOpen}
        onClose={closeMaterialsModal}
        materials={modalMaterials}
        customerName={modalCustomerName}
      />
    </div>
  );
}

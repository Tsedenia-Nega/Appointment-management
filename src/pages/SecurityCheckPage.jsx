import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  AlertTriangle,
  Info,
  Gavel,
  Check,
  ShieldCheck,
  Package,
  Search,
  Calendar,
} from "lucide-react";
import { BACKEND_URL } from "../config";

// --- Configuration ---

const ACCESS_TOKEN_KEY = "token";

// --- Helper Functions ---
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
  } catch (e) {
    return timeString;
  }
};

// --- Styled Checkbox Component ---
const StatusCheckbox = ({ id, label, checked, onChange, disabled }) => (
  <label
    htmlFor={id}
    className={`flex items-center space-x-2 cursor-pointer transition duration-200 ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
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
          ? "bg-gradient-to-tr from-red-500 to-pink-500 border-red-500"
          : "bg-white border-gray-300"
      } 
      ${!disabled && "shadow-md"}`}
    >
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span
      className={`text-sm font-medium ${
        checked ? "text-red-700" : "text-gray-700"
      }`}
    >
      {label}
    </span>
  </label>
);

// --- Materials Modal ---
const MaterialsModal = ({ isOpen, onClose, materials = [], customerName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white/70 backdrop-blur-md rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white/70 px-6 pt-5 pb-6 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-bold text-gray-900"
                  id="modal-title"
                >
                  Allowed Materials
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Full list of approved materials for{" "}
                  <strong>{customerName}</strong>.
                </p>
                <div className="mt-4">
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {materials.length > 0 ? (
                      materials.map((material, index) => (
                        <li
                          key={index}
                          className="flex items-center hover:bg-red-50 rounded-md px-2 py-1 transition"
                        >
                          <Check
                            size={14}
                            className="text-red-500 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {material}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">
                        No materials were specifically approved.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/70 px-6 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 shadow-md px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function SecurityCheckPage() {
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMaterials, setModalMaterials] = useState([]);
  const [modalCustomerName, setModalCustomerName] = useState("");

  const token = useMemo(() => localStorage.getItem(ACCESS_TOKEN_KEY), []);

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
      const res = await fetch(`${BACKEND_URL}/checkinout/${requestId}`, {
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
    } catch (e) {
      console.error(e);
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
        fetch(`${BACKEND_URL}/requests/approved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/requests/reassigned`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!approvedRes.ok)
        throw new Error(
          `Failed to fetch approved requests: ${approvedRes.statusText}`
        );
      const approvedData = await approvedRes.json();
      const reassignedData = reassignedRes.ok ? await reassignedRes.json() : [];

      const combinedDataMap = new Map();
      [...approvedData, ...reassignedData].forEach((appt) =>
        combinedDataMap.set(appt.id, appt)
      );
      let combinedData = Array.from(combinedDataMap.values());

      const statusPromises = combinedData.map((appt) =>
        fetchCheckInOutStatus(appt.id)
      );
      const allStatuses = await Promise.all(statusPromises);

      const enrichedData = combinedData.map((appt, index) => {
        const approvalData = appt.approval || {};
        const status = allStatuses[index];
        return {
          ...appt,
          securityPassed: status.securityPassed,
          checkedIn: status.checkedIn,
          checkedOut: status.checkedOut,
          inspectionRequired: approvalData.inspectionRequired ?? false,
          allowedMaterials: Array.isArray(approvalData.allowedMaterials)
            ? approvalData.allowedMaterials
            : [],
        };
      });

      setAllAppointments(enrichedData);
    } catch (err) {
      console.error(err);
      setFetchError(
        err.message || "Unexpected error while fetching appointments."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleToggle = async (apptId, actionType, currentStatus) => {
    if (currentStatus) return;
    if (actionLoading) return;
    setActionLoading(apptId);

    let apiEndpoint,
      statusField,
      apiBody = {};
    if (actionType === "security-pass") {
      apiEndpoint = `${BACKEND_URL}/checkinout/${apptId}/security-pass`;
      statusField = "securityPassed";
      apiBody = { securityPassed: true };
    } else if (actionType === "checkout") {
      apiEndpoint = `${BACKEND_URL}/checkinout/${apptId}/checkout`;
      statusField = "checkedOut";
      apiBody = { checkedOut: true };
    } else {
      setActionLoading(null);
      return;
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiBody),
      });
      if (!res.ok)
        throw new Error(`Failed to record ${actionType.replace("-", " ")}`);
      setAllAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId ? { ...appt, [statusField]: true } : appt
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((appt) => {
      const customerName =
        `${appt.customer?.firstName} ${appt.customer?.lastName}`.toLowerCase();
      const term = searchTerm.toLowerCase();
      const nameMatch = customerName.includes(term);
      const dateMatch = filterDate ? appt.appointmentDate === filterDate : true;
      return nameMatch && dateMatch;
    });
  }, [allAppointments, searchTerm, filterDate]);

  return (
    <div className="min-h-screen bg-gray-50  md:p-3">
      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-3  bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-300 shadow-inner focus:ring-2 focus:ring-red-400 focus:border-red-400 placeholder-gray-400 text-gray-900 transition-all duration-300 hover:shadow-lg"
          />
        </div>
        <div className="relative w-full md:w-60">
          <Calendar
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-300 shadow-inner focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300"
          />
        </div>
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

      {fetchError && (
        <div className="p-4 mb-4 text-sm rounded-lg flex items-center text-red-800 bg-red-100 shadow-md">
          <AlertTriangle size={20} className="mr-2" /> {fetchError}
          <button
            onClick={() => setFetchError(null)}
            className="ml-auto text-current hover:opacity-75"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <MaterialsModal
        isOpen={isModalOpen}
        onClose={closeMaterialsModal}
        materials={modalMaterials}
        customerName={modalCustomerName}
      />

      {isListLoading ? (
        <div className="text-center p-10 text-gray-600 flex items-center justify-center">
          <Loader2 size={24} className="mr-2 animate-spin" /> Loading approved
          appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
          <Info size={30} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium">
            {allAppointments.length > 0 && (searchTerm || filterDate)
              ? "No appointments match your current filter criteria."
              : "No approved appointments awaiting check or checkout."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-50 to-pink-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase w-1">
                  No
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Time Slot
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase hidden sm:table-cell">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Inspection Req.
                </th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase max-w-xs">
                  Materials
                </th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-600 uppercase">
                  Security Pass
                </th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-600 uppercase">
                  Checkout
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-gray-100">
              {filteredAppointments.map((appt, index) => {
                const customerName = `${appt.customer?.firstName} ${appt.customer?.lastName}`;
                const materialsCount = appt.allowedMaterials.length;
                const isCheckoutDisabled =
                  actionLoading === appt.id ||
                  appt.checkedOut ||
                  !appt.securityPassed;

                return (
                  <tr
                    key={appt.id}
                    className="hover:bg-white/50 hover:backdrop-blur-sm transition duration-300"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {customerName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatTime(appt.timeFrom)} - {formatTime(appt.timeTo)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 hidden sm:table-cell">
                      {appt.appointmentDate}
                    </td>

                    {/* Inspection Required */}
                    <td className="py-3 px-4 text-sm">
                      {appt.inspectionRequired ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          <Gavel size={12} className="mr-1" /> YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <Check size={12} className="mr-1" /> NO
                        </span>
                      )}
                    </td>

                    {/* Allowed Materials */}
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {materialsCount > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
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
                              className="px-2 py-0.5 text-xs font-medium text-white bg-gray-500 hover:bg-gray-600 rounded transition-colors"
                            >
                              +{materialsCount - 1} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-xs">
                          None
                        </span>
                      )}
                    </td>

                    {/* Security Pass */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <StatusCheckbox
                          id={`security-${appt.id}`}
                          label="Security Pass"
                          checked={appt.securityPassed}
                          onChange={() =>
                            handleToggle(
                              appt.id,
                              "security-pass",
                              appt.securityPassed
                            )
                          }
                          disabled={
                            actionLoading === appt.id || appt.securityPassed
                          }
                        />
                      </div>
                    </td>

                    {/* Checkout */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <StatusCheckbox
                          id={`checkout-${appt.id}`}
                          label="Checkout"
                          checked={appt.checkedOut}
                          onChange={() =>
                            handleToggle(appt.id, "checkout", appt.checkedOut)
                          }
                          disabled={isCheckoutDisabled}
                        />
                      </div>
                      {!appt.securityPassed && (
                        <p className="text-xs text-red-500 mt-1">
                          Pass required
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

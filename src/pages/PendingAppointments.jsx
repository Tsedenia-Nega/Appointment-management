import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { BACKEND_URL } from "../config";
// Base URL and token

const ACCESS_TOKEN_KEY = "token";

// Allowed materials options (fixed, default list)
const allowedOptions = [
  "Laptop",
  "Phone",
  "PC",
  "Document",
  "USB Drive",
  "Camera",
];

// --- Helper function for material logic (Critical for the fix) ---
const normalizeMaterial = (m) => (m ? m.trim().toLowerCase() : "");
// -----------------------------------------------------------------

// --- 1. Toast Notification Component (Replaces alert/confirm) ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <Check size={20} className="text-green-500" />;
      case "error":
        return <AlertTriangle size={20} className="text-red-500" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-400";
      case "error":
        return "bg-red-100 border-red-400";
      case "info":
      default:
        return "bg-blue-100 border-blue-400";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] p-4 pr-10 rounded-lg shadow-xl border-l-4 transition-all duration-300 ${getColorClass(
        type
      )}`}
      style={{
        transform: message ? "translateX(0)" : "translateX(120%)",
        opacity: message ? 1 : 0,
      }}
    >
      <div className="flex items-center space-x-3">
        {getIcon(type)}
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// --- 2. Helper component for detail display ---

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-2 text-gray-700">
    <Icon size={16} className="text-blue-500 mt-1 flex-shrink-0" />
    <div className="flex flex-col">
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  </div>
);

// --- 3. Reassign Modal (omitted for brevity, assume content is stable) ---

const ReassignModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allowedOptions,
}) => {
  const [reassignedDate, setReassignedDate] = useState("");
  const [reassignedTimeFrom, setReassignedTimeFrom] = useState("");
  const [reassignedTimeTo, setReassignedTimeTo] = useState("");
  const [allowedMaterials, setAllowedMaterials] = useState([]);
  const [inspectionRequiredStatus, setInspectionRequiredStatus] =
    useState("Not Required");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const date =
        initialData.reassignedDate || initialData.appointmentDate || "";
      const timeFrom =
        initialData.reassignedTimeFrom || initialData.timeFrom || "";
      const timeTo = initialData.reassignedTimeTo || initialData.timeTo || "";

      setReassignedDate(date);
      setReassignedTimeFrom(timeFrom);
      setReassignedTimeTo(timeTo);
      // For reassign, reset materials/inspection to allow fresh configuration
      setAllowedMaterials([]);
      setInspectionRequiredStatus("Not Required");
    }
  }, [isOpen, initialData]);

  const handleMaterialChange = (e) => {
    const material = e.target.value;
    const isChecked = e.target.checked;
    setAllowedMaterials((prev) =>
      isChecked ? [...prev, material] : prev.filter((m) => m !== material)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reassignedDate || !reassignedTimeFrom || !reassignedTimeTo) {
      console.error("Please fill in the New Date and Time slot.");
      return;
    }
    setIsLoading(true);
    try {
      const inspectionRequired = inspectionRequiredStatus === "Required";
      await onSubmit({
        reassignedDate,
        reassignedTimeFrom,
        reassignedTimeTo,
        allowedMaterials,
        inspectionRequired,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2 text-yellow-600" /> Reassign
              Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={reassignedDate}
                  onChange={(e) => setReassignedDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label
                    htmlFor="timeFrom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time From *
                  </label>
                  <input
                    type="time"
                    id="timeFrom"
                    value={reassignedTimeFrom}
                    onChange={(e) => setReassignedTimeFrom(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="timeTo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Time To *
                  </label>
                  <input
                    type="time"
                    id="timeTo"
                    value={reassignedTimeTo}
                    onChange={(e) => setReassignedTimeTo(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Allowed Materials (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {allowedOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`modal-material-${opt}`}
                      value={opt}
                      checked={allowedMaterials.includes(opt)}
                      onChange={handleMaterialChange}
                      className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label
                      htmlFor={`modal-material-${opt}`}
                      className="text-sm text-gray-700 select-none"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Security Inspection Required *
              </label>
              <div className="flex space-x-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {["Required", "Not Required"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`modal-security-${status}`}
                      name="modal-security-check-required"
                      value={status}
                      checked={inspectionRequiredStatus === status}
                      onChange={(e) =>
                        setInspectionRequiredStatus(e.target.value)
                      }
                      className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                      required
                    />
                    <label
                      htmlFor={`modal-security-${status}`}
                      className="text-sm text-gray-700 select-none"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition shadow-md disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                    Reassigning...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} className="mr-2" /> Reassign
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- 4. Rejection Prompt Modal (omitted for brevity, assume content is stable) ---

const RejectionPromptModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replacing alert with console.error as per instructions
    if (reason.trim() === "") {
      console.error("Rejection reason cannot be empty.");
      return;
    }
    onSubmit(reason);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Slash className="w-5 h-5 mr-2 text-red-600" /> Confirm Rejection
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 transition rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a brief reason for rejecting this appointment.
            </p>
            <div>
              <textarea
                id="rejection-reason"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="e.g., Conflicting schedule, security risk, missing documents..."
                required
              />
            </div>
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-md disabled:opacity-50"
                disabled={isLoading || reason.trim() === ""}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                    Rejecting...
                  </>
                ) : (
                  <>
                    <Slash size={16} className="mr-2" /> Reject Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Custom Material Input Component (FIXED: State is now isolated here) ---

const CustomMaterialInput = ({
  currentMaterials,
  updateMaterials,
  showToast,
}) => {
  const [customMaterialText, setCustomMaterialText] = useState("");

  const handleAddCustomMaterial = useCallback(
    (e) => {
      e.preventDefault();
      const material = customMaterialText.trim();
      if (!material) {
        showToast("Please enter a material name.", "info");
        return;
      }

      const normalizedMaterial = normalizeMaterial(material);

      // Check if the normalized material already exists in the current list
      const isDuplicate = currentMaterials.some(
        (m) => normalizeMaterial(m) === normalizedMaterial
      );
      if (isDuplicate) {
        showToast(`"${material}" (or similar) is already listed.`, "info");
        setCustomMaterialText(""); // Clear on error, not on every render
        return;
      }

      // Add the new material (preserving its custom casing)
      const newMaterials = [...currentMaterials, material];
      updateMaterials(newMaterials);
      setCustomMaterialText(""); // Clear on successful add
    },
    [customMaterialText, currentMaterials, showToast, updateMaterials]
  );

  return (
    <form onSubmit={handleAddCustomMaterial} className="space-y-2 pt-2">
      <label className="block text-sm font-medium text-gray-700">
        Add Custom Material
      </label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={customMaterialText}
          onChange={(e) => setCustomMaterialText(e.target.value)}
          placeholder="e.g., Tablet, Sketchpad"
          className="flex-grow border border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 flex-shrink-0"
          disabled={!customMaterialText.trim()}
        >
          <Plus size={16} className="sm:mr-1" />{" "}
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </form>
  );
};

// --- 5. Pending Appointments Page (Main Component) ---

export default function PendingAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // State to hold dynamic configuration for approval/rejection (materials/inspection)
  const [approvalConfigs, setApprovalConfigs] = useState({});
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // State for rejection modal
  const [isRejectPromptOpen, setIsRejectPromptOpen] = useState(false);
  const [currentApptToRejectId, setCurrentApptToRejectId] = useState(null);

  const [actionLoading, setActionLoading] = useState(null); // Tracks ID of appointment being acted upon
  const [isListLoading, setIsListLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const token = useMemo(() => localStorage.getItem(ACCESS_TOKEN_KEY), []);
  const selectedAppointment = appointments.find(
    (appt) => appt.id === expandedId
  );

  // Helper to update the approval configuration for a specific appointment ID
  const updateApprovalConfig = useCallback((id, key, value) => {
    setApprovalConfigs((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { materials: [], inspection: "Not Required" }),
        [key]: value,
      },
    }));
  }, []);

  const showToast = (message, type) => setToast({ message, type });

  // Fetch pending appointments
  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setFetchError("Authentication token not found.");
      setIsListLoading(false);
      return;
    }

    setIsListLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Failed to fetch pending requests: ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // response was not JSON, use default error message
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setFetchError(
        err.message ||
          "An unexpected error occurred while fetching appointments."
      );
      showToast("Failed to load appointments.", "error");
    } finally {
      setIsListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    // Initialize config if opening a new row
    if (expandedId !== id) {
      if (!approvalConfigs[id]) {
        updateApprovalConfig(id, "materials", []);
        updateApprovalConfig(id, "inspection", "Not Required");
      }
    }
  };

  const handleApprove = async (appt) => {
    if (actionLoading) return;

    // Check if configuration is available (should be initialized on expand)
    const config = approvalConfigs[appt.id] || {
      materials: [],
      inspection: "Not Required",
    };

    if (config.materials.length === 0 && config.inspection === "Not Required") {
      showToast(
        "Please configure allowed materials and inspection status before approving.",
        "info"
      );
      return;
    }

    // Custom confirmation UI logic (using native confirm as it's the expected interaction pattern for this environment)
    if (
      !window.confirm(
        `Are you sure you want to APPROVE this appointment with the selected settings?`
      )
    )
      return;

    setActionLoading(appt.id);

    const approvalPayload = {
      allowedMaterials: config.materials,
      inspectionRequired: config.inspection === "Required",
    };

    // --- CRITICAL DEBUGGING LOG ---
    console.log("--- APPROVAL PAYLOAD START ---");
    console.log(`Sending payload for Appointment ID: ${appt.id}`);
    console.log("Allowed Materials:", approvalPayload.allowedMaterials);
    console.log("Inspection Required:", approvalPayload.inspectionRequired);
    console.log("--- APPROVAL PAYLOAD END ---");
    // ----------------------------

    try {
      const res = await fetch(`${BASE_URL}/approvals/${appt.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(approvalPayload),
      });
      if (!res.ok) throw new Error("Failed to approve appointment.");

      showToast("Appointment approved successfully!", "success");
      fetchAppointments();
      setExpandedId(null);
    } catch (err) {
      console.error("Approval error:", err);
      showToast(
        `Error approving appointment: ${err.message || "Check console."}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Function called by the RejectionPromptModal
  const handleReject = async (apptId, reason) => {
    if (actionLoading || !reason) return;

    setActionLoading(apptId);
    setIsRejectPromptOpen(false);
    setCurrentApptToRejectId(null);

    try {
      const res = await fetch(`${BASE_URL}/approvals/${apptId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        const errorMessage = errorBody.message
          ? errorBody.message.join(", ")
          : "Failed to reject appointment";
        throw new Error(errorMessage);
      }

      showToast("Appointment rejected successfully!", "success");
      fetchAppointments();
      setExpandedId(null);
    } catch (err) {
      console.error("Rejection error:", err);
      showToast(
        `Error rejecting appointment: ${err.message || "Check console."}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReassignSubmit = async (reassignData) => {
    if (!selectedAppointment) return;
    setActionLoading(selectedAppointment.id);

    // Custom confirmation
    if (
      !window.confirm(
        `Confirm reassigning appointment to ${reassignData.reassignedDate}?`
      )
    ) {
      setActionLoading(null);
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/approvals/${selectedAppointment.id}/reassign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reassignData),
        }
      );
      if (!res.ok) throw new Error("Failed to reassign appointment.");

      showToast("Appointment reassigned successfully!", "success");
      fetchAppointments();
      setIsReassignModalOpen(false);
      setExpandedId(null);
    } catch (err) {
      console.error("Reassign error:", err);
      showToast(
        `Error reassigning appointment: ${err.message || "Check console."}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to open the rejection prompt modal
  const openRejectPrompt = (apptId) => {
    setCurrentApptToRejectId(apptId);
    setIsRejectPromptOpen(true);
  };

  // Component for the expanded detail view within the table
  const ExpandedRow = ({ appt }) => {
    const config = approvalConfigs[appt.id] || {
      materials: [],
      inspection: "Not Required",
    };
    const currentMaterials = config.materials || [];

    // Use a memoized set of normalized allowed options for efficient comparison
    const normalizedAllowedOptions = useMemo(
      () => new Set(allowedOptions.map(normalizeMaterial)),
      []
    );

    // Handler passed to the custom input component to update the main state
    const updateMaterialsInConfig = useCallback(
      (newMaterials) => {
        updateApprovalConfig(appt.id, "materials", newMaterials);
      },
      [appt.id, updateApprovalConfig]
    );

    /**
     * Handles changes for fixed material checkboxes.
     * Uses normalized names for robust, case-insensitive removal.
     */
    const handleMaterialChange = (e) => {
      const material = e.target.value; // e.g., "Laptop"
      const isChecked = e.target.checked;
      const normalizedMaterial = normalizeMaterial(material);

      const newMaterials = isChecked
        ? // Add the material (using original casing from allowedOptions)
          [...currentMaterials, material]
        : // Remove the material, checking by normalized name
          currentMaterials.filter(
            (m) => normalizeMaterial(m) !== normalizedMaterial
          );

      updateMaterialsInConfig(newMaterials);
    };

    /**
     * Handles removing custom materials from the chips.
     */
    const handleRemoveCustomMaterial = (materialToRemove) => {
      const normalizedMaterialToRemove = normalizeMaterial(materialToRemove);

      const newMaterials = currentMaterials.filter(
        (m) => normalizeMaterial(m) !== normalizedMaterialToRemove
      );
      updateMaterialsInConfig(newMaterials);
    };

    // Filter out fixed options to only show custom added ones as chips
    const customMaterials = currentMaterials.filter(
      (m) => !normalizedAllowedOptions.has(normalizeMaterial(m))
    );

    return (
      <td
        colSpan="6"
        className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 shadow-inner"
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Appointment/Customer Details */}
          <div className="flex-1 space-y-4 lg:pr-6 lg:border-r border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center mb-4">
              <User size={18} className="mr-2 text-blue-600" /> Customer &
              Appointment Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                label="Full Name"
                value={`${appt.customer?.firstName || ""} ${
                  appt.customer?.lastName || ""
                }`}
                icon={User}
              />
              <DetailItem
                label="Purpose"
                value={appt.purpose}
                icon={Briefcase}
              />
              <DetailItem
                label="Email"
                value={appt.customer?.email}
                icon={Mail}
              />
              <DetailItem
                label="Phone"
                value={appt.customer?.phone}
                icon={Phone}
              />
              <DetailItem
                label="Date"
                value={appt.reassignedDate || appt.appointmentDate}
                icon={Calendar}
              />
              <DetailItem
                label="Time"
                value={`${appt.reassignedTimeFrom || appt.timeFrom} - ${
                  appt.reassignedTimeTo || appt.timeTo
                }`}
                icon={Clock}
              />
              <DetailItem
                label="Organization"
                value={appt.customer?.organization}
                icon={Briefcase}
              />
              <DetailItem
                label="Location"
                value={`${appt.customer?.city || ""}, ${
                  appt.customer?.country || ""
                }`}
                icon={MapPin}
              />
            </div>
          </div>

          {/* Security & Action Controls */}
          <div className="flex-1 space-y-4 lg:pl-6 pt-6 lg:pt-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center mb-4">
              <ShieldCheck size={18} className="mr-2 text-green-600" /> Security
              Configuration
            </h3>

            {/* Allowed Materials Checkboxes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fixed Allowed Materials
              </label>
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                {allowedOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`material-${appt.id}-${opt}`}
                      value={opt}
                      // Use normalized comparison for checked status
                      checked={currentMaterials.some(
                        (m) => normalizeMaterial(m) === normalizeMaterial(opt)
                      )}
                      onChange={handleMaterialChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`material-${appt.id}-${opt}`}
                      className="text-sm text-gray-700 select-none"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Material Input (FIXED: State is now isolated here) */}
            <CustomMaterialInput
              currentMaterials={currentMaterials}
              updateMaterials={updateMaterialsInConfig}
              showToast={showToast}
            />

            {/* Display Custom Materials */}
            {customMaterials.length > 0 && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Added:
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-white border border-dashed border-gray-200 rounded-lg shadow-sm">
                  {customMaterials.map((material) => (
                    <span
                      key={material}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full cursor-pointer hover:bg-purple-200 transition"
                      onClick={() => handleRemoveCustomMaterial(material)}
                      title="Click to remove"
                    >
                      {material}
                      <Trash2 size={12} className="ml-1 text-purple-600" />
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection Radio Buttons */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-gray-700">
                Security Inspection Required
              </label>
              <div className="flex space-x-6 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                {["Required", "Not Required"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`security-${appt.id}-${status}`}
                      name={`security-check-${appt.id}`}
                      value={status}
                      checked={config.inspection === status}
                      onChange={(e) =>
                        updateApprovalConfig(
                          appt.id,
                          "inspection",
                          e.target.value
                        )
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`security-${appt.id}-${status}`}
                      className="text-sm text-gray-700 select-none"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons (Responsive) */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => handleApprove(appt)}
                disabled={actionLoading === appt.id}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md disabled:opacity-50 text-sm w-full sm:w-auto justify-center"
              >
                {actionLoading === appt.id ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Check size={16} className="mr-2" />
                )}
                Approve
              </button>
              <button
                // Opens the Rejection Prompt Modal
                onClick={() => openRejectPrompt(appt.id)}
                disabled={actionLoading === appt.id}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-md disabled:opacity-50 text-sm w-full sm:w-auto justify-center"
              >
                {actionLoading === appt.id ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Slash size={16} className="mr-2" />
                )}
                Reject
              </button>
              <button
                onClick={() => setIsReassignModalOpen(true)}
                disabled={actionLoading !== null} // Disable all actions if one is pending
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold shadow-md disabled:opacity-50 text-sm w-full sm:w-auto justify-center"
              >
                <RotateCcw size={16} className="mr-2" /> Reassign
              </button>
            </div>
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50  sm:p-6 lg:p-2">
      {/* <h1 className="text-2xl font-bold text-gray-900 mb-6">
        <Clock className="inline w-6 h-6 mr-2 text-blue-600" /> Pending
        Appointments
        <button
          onClick={fetchAppointments}
          disabled={isListLoading}
          className="ml-4 p-1 rounded-full text-gray-500 hover:text-blue-600 transition disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={isListLoading ? "animate-spin" : ""}
          />
        </button>
      </h1> */}

      {fetchError && (
        <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg flex items-center border border-red-200">
          <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {isListLoading ? (
        <div className="text-center  text-gray-600 flex items-center justify-center bg-white rounded-xl shadow-lg">
          <Loader2 size={24} className="mr-2 animate-spin" /> Loading pending
          appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center p-1 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-white shadow-sm">
          <Info size={30} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium">No pending appointments found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50/50">
              <tr>
                <th className="py-1 px-5 text-left text-xs font-bold text-gray-600 uppercase w-1">
                  No
                </th>
                <th className="py-1 px-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Name
                </th>
                <th className="py-1 px-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Email
                </th>
                <th className="py-1 px-4 text-left text-xs font-bold text-gray-600 uppercase hidden md:table-cell">
                  Date
                </th>
                <th className="py-1 px-4 text-left text-xs font-bold text-gray-600 uppercase hidden sm:table-cell">
                  Status
                </th>
                <th className="py-1 px-4 text-right text-xs font-bold text-gray-600 uppercase w-1">
                  <Eye size={16} />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {appointments.map((appt, index) => (
                <React.Fragment key={appt.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer transition duration-150"
                    onClick={() => handleToggleExpand(appt.id)}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {appt.customer?.firstName} {appt.customer?.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {appt.customer?.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap hidden md:table-cell">
                      {appt.reassignedDate || appt.appointmentDate}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize hidden sm:table-cell">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full shadow-sm">
                        <Clock size={12} className="mr-1" />
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="text-gray-500 hover:text-blue-600 p-1 transition rounded-full"
                        aria-label={
                          expandedId === appt.id
                            ? "Collapse Details"
                            : "Expand Details"
                        }
                      >
                        {expandedId === appt.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedId === appt.id && (
                    <tr className="border-b border-blue-200">
                      <ExpandedRow appt={appt} />
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reassign Modal */}
      <ReassignModal
        isOpen={isReassignModalOpen && selectedAppointment !== null}
        onClose={() => setIsReassignModalOpen(false)}
        onSubmit={handleReassignSubmit}
        initialData={selectedAppointment}
        allowedOptions={allowedOptions}
      />

      {/* Rejection Reason Modal */}
      <RejectionPromptModal
        isOpen={isRejectPromptOpen && currentApptToRejectId !== null}
        onClose={() => {
          setIsRejectPromptOpen(false);
          setCurrentApptToRejectId(null);
        }}
        onSubmit={(reason) => handleReject(currentApptToRejectId, reason)}
        isLoading={actionLoading === currentApptToRejectId}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </div>
  );
}

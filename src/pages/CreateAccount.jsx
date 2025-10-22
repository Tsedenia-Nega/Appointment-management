import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";
// const API_BASE_URL = import.meta.env.API_BASE_URL;

const ACCESS_TOKEN_KEY = "token"; 

const formatRoleKey = (key) => {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    "fixed bottom-5 right-5 p-4 rounded-xl shadow-lg transition-opacity duration-300 z-50 flex items-center";
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 font-bold opacity-75 hover:opacity-100">
        &times;
      </button>
    </div>
  );
};

const CreateAccount = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
  });

 
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleDisplay, setSelectedRoleDisplay] = useState("Select Role");
  const [rolesError, setRolesError] = useState("");


  const fetchRoles = useCallback(async (retries = 3) => {
    
    const canonicalRoles = ["FRONT_DESK", "SECRETARY", "SECURITY"];
    setRolesError("");

    const url = `${API_BASE_URL}/auth/roles`;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch roles.");
        }

        const rolesData = await response.json();

        const formattedRoles = rolesData.map((role) => ({
          key: role.name,
          display: formatRoleKey(role.name),
        }));

        const filteredRoles = formattedRoles.filter(
          (role) => role.key !== "CEO",
        );

        setAvailableRoles(filteredRoles);
        return; // Success, exit function
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          
          const fallbackRoles = canonicalRoles.map((key) => ({
            key: key,
            display: formatRoleKey(key),
          }));
          setAvailableRoles(fallbackRoles);
          // setRolesError(
          //   "Could not load roles after multiple attempts. Using fallback roles. Check backend API connection."
          // );
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleSelect = (key, display) => {
    setFormData({ ...formData, role: key }); // Store the canonical key
    setSelectedRoleDisplay(display); // Store the display name for the UI
    setShowDropdown(false);
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ message: "", type: "" });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    closeNotification();
    setLoading(true);

    if (!formData.role) {
      setNotification({ message: "Please select a role.", type: "error" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setNotification({
        message: "Password must be at least 8 characters long.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // Retrieve token from local storage using the correct key
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    // Authorization check for STAFF creation (token is MANDATORY)
    if (!token) {
      setNotification({
        message:
          "Authorization token is missing. Please log in as CEO to create staff accounts.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // Prepare the payload
    const payload = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setNotification({
          message: `Staff account (${formData.role}) created successfully!`,
          type: "success",
        });

      
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          role: "",
          password: "",
        });
        setSelectedRoleDisplay("Select Role");
        navigate("/dashboard");
      } else {
        setNotification({
          message: data.message || "Failed to create account.",
          type: "error",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      setNotification({
        message: "A network error occurred while creating the account.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gradient-to-br from-indigo-50 via-white to-purple-50 ">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-4 border border-gray-200">
        <h2 className="text-2xl  text-center text-gray-800 mb-8">
          Create User
        </h2>

        {rolesError && (
          <div
            className="p-3 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg"
            role="alert"
          >
            {rolesError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Middle Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center justify-between w-full border ${
                formData.role ? "border-gray-300" : "border-red-400"
              } rounded-lg px-4 py-2.5 cursor-pointer transition duration-150 focus-within:ring-2 focus-within:ring-blue-500 shadow-sm`}
              onClick={() => setShowDropdown(!showDropdown)}
              role="button"
              tabIndex="0"
            >
              <span
                className={
                  formData.role ? "text-gray-900 font-medium" : "text-gray-500"
                }
              >
                {selectedRoleDisplay}
              </span>
              <ChevronDown
                className="text-gray-500 w-5 h-5 transition-transform duration-200"
                style={{
                  transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>

            {showDropdown && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                {availableRoles.map(({ key, display }) => (
                  <li
                    key={key}
                    onClick={() => handleSelect(key, display)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 transition duration-100"
                  >
                    {display}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
            } text-white rounded-xl py-3 font-bold transition-all duration-300 mt-6`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    </div>
  );
};

export default CreateAccount;

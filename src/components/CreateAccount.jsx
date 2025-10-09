import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { API_BASE_URL } from "../config"; // base URL from .env

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const roles = ["Front Desk", "Secretary", "Security"];

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role selection
  const handleSelect = (role) => {
    setFormData({ ...formData, role });
    setShowDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Retrieve token from local storage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token is required to create an account.");
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // include token
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert(" Account created successfully!");
        console.log("Response:", data);

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          role: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        alert(data.message || " Failed to create account.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("An error occurred while creating the account.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Role
            </label>
            <div
              className="flex items-center justify-between w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span
                className={formData.role ? "text-gray-900" : "text-gray-400"}
              >
                {formData.role || "Select Role"}
              </span>
              <ChevronDown className="text-gray-500 w-5 h-5" />
            </div>

            {showDropdown && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-lg mt-1 shadow-lg">
                {roles.map((role, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(role)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-lg py-2 font-semibold transition-all mt-2`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;

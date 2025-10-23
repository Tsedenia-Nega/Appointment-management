import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";


const CEORegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register-ceo`, formData);
      setMessage("CEO registered successfully!");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div
    //   className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
    //   style={{
    //     backgroundImage: "url('/images/bg.jpeg')",
    //   }}
    // >
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg.jpeg')" }}
    >
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Form Card */}
      <div className="relative max-w-md w-full p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-10 transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-8">
          Register CEO
        </h2>

        {message && (
          <p className="bg-green-100/80 text-green-800 p-2 rounded-md mb-4 text-center font-medium backdrop-blur-sm">
            {message}
          </p>
        )}
        {error && (
          <p className="bg-red-100/80 text-red-700  rounded-sm mb-4 text-center font-medium backdrop-blur-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="peer w-full border border-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm placeholder-transparent bg-white/30 backdrop-blur-sm text-black"
                placeholder="First Name"
              />
              <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-blue-400 peer-focus:text-sm">
                First Name
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="peer w-full border border-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm placeholder-transparent bg-white/30 backdrop-blur-sm text-black"
                placeholder="Middle Name"
              />
              <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-blue-400 peer-focus:text-sm">
                Middle Name
              </label>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="peer w-full border border-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm placeholder-transparent bg-white/30 backdrop-blur-sm text-black"
              placeholder="Last Name"
            />
            <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-blue-400 peer-focus:text-sm">
              Last Name
            </label>
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="peer w-full border border-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm placeholder-transparent bg-white/30 backdrop-blur-sm text-black"
              placeholder="Email"
            />
            <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-blue-400 peer-focus:text-sm">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="peer w-full border border-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm placeholder-transparent bg-white/30 backdrop-blur-sm text-black"
              placeholder="Password"
            />
            <label className="absolute left-4 top-3 text-gray-200 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-blue-400 peer-focus:text-sm">
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold py-3 rounded-2xl hover:from-blue-400 hover:to-blue-600 shadow-lg transition-all transform hover:-translate-y-0.5 hover:scale-105"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CEORegister;

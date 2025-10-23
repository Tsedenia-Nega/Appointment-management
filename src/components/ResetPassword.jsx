import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"; // Added Eye/EyeOff for password visibility
import { BACKEND_URL } from "../config";
const ResetPassword = () => {
  const { token } = useParams(); // <-- get token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle visibility

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // --- NEW: Password length check ---
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    // ---------------------------------

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message || "Failed to reset password. Link may be expired."
        );
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login"); // redirect to login page
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-200 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-3xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-4xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-4 shadow-md">
            <LockKeyhole className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Secure Password Reset
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your new password below.
          </p>
        </div>

        {/* Dynamic Alert Messages */}
        {error && (
          <div className="flex items-center bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
            <ShieldCheck className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition duration-300"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 pr-10 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition duration-300"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full text-white py-3 rounded-xl font-semibold text-lg tracking-wide transition duration-300 ease-in-out flex justify-center items-center transform active:scale-[0.99] shadow-lg ${
              loading || password.length < 6 || password !== confirmPassword // Visual check remains here
                ? "bg-indigo-300 cursor-not-allowed opacity-80"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/50 hover:shadow-xl"
            }`}
            disabled={
              loading || password.length < 6 || password !== confirmPassword
            } // Disabled when inputs don't meet requirements
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6 mr-3" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      {/* Custom Global Styles for Animations */}
      <style jsx global>{`
        /* ... (Custom Global Styles retained) ... */
        .shadow-3xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .shadow-4xl {
          box-shadow: 0 30px 40px -10px rgba(0, 0, 0, 0.2),
            0 15px 20px -5px rgba(0, 0, 0, 0.08);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;

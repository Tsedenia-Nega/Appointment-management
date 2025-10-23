import { useState } from "react";
import axios from "axios";
import { Loader2, Mail } from "lucide-react";
import { BACKEND_URL } from "../config";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // NO CHANGES TO THE BACKEND LOGIC OR FUNCTIONALITY
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/forgot-password`,
        { email }
      );
      setMsg(res.data.message);
       setTimeout(() => {
         navigate("/login"); // Redirects to login page
       }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        // WIDER CARD: Changed max-w-sm (24rem) to max-w-md (28rem)
        // Card Animation: Added scale and pulse on hover
        className="bg-white shadow-2xl rounded-2xl p-8 sm:p-12 w-full max-w-md transform transition-all duration-500 ease-in-out hover:shadow-4xl hover:scale-[1.01] hover:animate-subtle-pulse"
      >
        <div className="text-center mb-10">
          {/* Enhanced header with a focus icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-5">
            <Mail className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Enter your email to receive a secure reset link.
          </p>
        </div>

        {/* Improved error/message alerts */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm transition-opacity duration-300 animate-fadeIn font-medium">
            <p className="text-center">{error}</p>
          </div>
        )}
        {msg && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6 text-sm transition-opacity duration-300 animate-fadeIn font-medium">
            <p className="text-center">{msg}</p>
          </div>
        )}

        <div className="mb-8 relative">
          {/* Email input with icon and professional focus state */}
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-blue-600 transition-colors" />
          <input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Professional Focus Ring: focus:ring-4 with a blue-200 color
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-300 ease-in-out peer"
            required
          />
        </div>

        <button
          type="submit"
          // Button Styling: Updated padding and stronger disabled state
          className={`w-full text-white p-4 rounded-xl font-bold text-lg tracking-wide transition duration-300 ease-in-out flex justify-center items-center transform active:scale-[0.98] ${
            loading || !email.trim() // Disabled when loading OR when email is empty
              ? "bg-blue-400 cursor-not-allowed opacity-75"
              : "bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl"
          }`}
          disabled={loading || !email.trim()}
        >
          {loading ? (
            <Loader2 className="animate-spin h-6 w-6 mr-2" />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* Custom Styles and Keyframe Animations */}
      <style jsx global>{`
        /* Simple animation for message visibility (retained) */
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Custom Shadows for better depth (updated) */
        .shadow-3xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .shadow-4xl {
          box-shadow: 0 30px 40px -10px rgba(0, 0, 0, 0.15),
            0 15px 20px -5px rgba(0, 0, 0, 0.08);
        }

        /* Subtle Pulse Animation for Professionalism */
        @keyframes subtle-pulse {
          0%,
          100% {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          50% {
            box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.2),
              0 12px 12px -5px rgba(0, 0, 0, 0.06);
          }
        }
        .hover\\:animate-subtle-pulse:hover {
          animation: subtle-pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ceoExists, setCeoExists] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCeo = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/ceo-exists`);
        setCeoExists(res.data.exists);
      } catch (err) {
        console.error("Error checking CEO:", err);
        setCeoExists(true);
      }
    };
    checkCeo();
  }, []);

  const permissionRedirectMap = {
    view_dashboard: "/dashboard",
    approve_request: "/pending",
    view_appointment: "/view",
    manage_roles: "/roles",
    create_appointment: "/create",
    check_in: "/checkin",
    check_out: "/security",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, access_token: data.access_token })
      );
      setUser({ ...data.user, access_token: data.access_token });

      const userPermissions = data.user?.role?.permissions || [];
      let redirectPath = "/dashboard";
      for (const perm of userPermissions) {
        if (permissionRedirectMap[perm.key]) {
          redirectPath = permissionRedirectMap[perm.key];
          break;
        }
      }
      navigate(redirectPath);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg.jpeg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* ===================================================================
        LEFT PANEL (Styled beautifully)
      =================================================================== */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-center items-start p-16 text-white z-10">
        {/* Animated blobs */}
        <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-10 left-10 animate-blob-one"></div>
        <div className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl bottom-20 right-20 animate-blob-two"></div>

        {/* Title */}
        <h1
          className="text-6xl font-extrabold mb-6 relative z-10 
                     bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-400 
                     bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] 
                     animate-fadeUp tracking-wide leading-tight"
        >
          {/* Visit Management */}
          <span className="whitespace-nowrap ">Visit Management</span>
          <br />
          <span className="text-6xl font-semibold block text-center text-white/90">
            System
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="text-lg text-white/80 max-w-md leading-relaxed relative z-10 
                     font-medium animate-fadeUp delay-[300ms]"
        >
          Simplify your workflow. Manage appointments, check-ins, check-outs,
          and visitor activity — all in one intuitive dashboard.
        </p>

        {/* Optional glowing accent line */}
        <div className="mt-8 h-1 w-32 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-glow"></div>
      </div>

      {/* ===================================================================
        RIGHT PANEL (Login Form)
      =================================================================== */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-8 z-10 lg:justify-end lg:pr-24">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.01]">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full shadow-lg ring-4 ring-blue-300/30 animate-pulse-slow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="flex justify-center items-center gap-2 text-3xl font-extrabold text-white drop-shadow-sm">
              Welcome Back{" "}
              <span className="text-3xl animate-wave-hand origin-bottom">
                👋
              </span>
            </h2>
            <p className="mt-2 text-sm text-gray-200 font-medium tracking-wide">
              Sign in to manage appointments
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg shadow-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-gray-300 text-white transition duration-150"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg shadow-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-gray-300 text-white transition duration-150"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="p-2 text-red-200 bg-red-800/80 border border-red-700 rounded-md text-sm text-center animate-fadeIn">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-600 focus:outline-none  transition duration-200 ease-in-out transform hover:scale-[1.01] active:scale-95"
            >
              Sign in
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm">
            <a
              href="/forgot-password"
              className="text-blue-300 hover:underline font-medium"
            >
              Forgot Password?
            </a>
            {!ceoExists && (
              <Link
                to="/register-ceo"
                className="text-blue-300 hover:underline font-medium"
              >
                Register CEO
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes blob-one {
          0%,100% { transform: translate(0,0) scale(1);}
          30% { transform: translate(20px,-30px) scale(1.1);}
          60% { transform: translate(-10px,10px) scale(0.9);}
        }
        @keyframes blob-two {
          0%,100% { transform: translate(0,0) scale(1);}
          25% { transform: translate(-15px,20px) scale(1.05);}
          70% { transform: translate(25px,-10px) scale(0.95);}
        }
        @keyframes wave-hand {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(15deg); }
          20%, 40%, 60%, 80% { transform: rotate(-8deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .animate-blob-one { animation: blob-one 8s infinite ease-in-out; }
        .animate-blob-two { animation: blob-two 10s infinite ease-in-out; }
        .animate-wave-hand { animation: wave-hand 2s infinite ease-in-out; display: inline-block; }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
        .animate-fadeUp { animation: fadeUp 1s ease-out forwards; }
        .animate-glow { animation: glow 3s infinite alternate ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}

export default Login;

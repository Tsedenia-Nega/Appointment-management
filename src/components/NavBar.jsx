import { useState } from "react";
import logo from "../assets/logo.jpg";
import { useAuth } from "../context/useAuth";

const BellIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SettingsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 mr-2">
    <circle cx="12" cy="12" r="3"></circle>
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 
      2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 
      1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 
      2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 
      1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 
      1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 
      1.65 0 0 0-.33-1.82 1.65 1.65 0 0 
      0-1.51-1H3a2 2 0 0 1-2-2 
      2 2 0 0 1 2-2h.09a1.65 1.65 0 0 
      0 1.51-1 1.65 1.65 0 0 
      0-.33-1.82l-.06-.06a2 2 0 0 
      1 0-2.83 2 2 0 0 1 2.83 
      0l.06.06a1.65 1.65 0 0 
      0 1.82.33H9a1.65 1.65 0 0 
      0 1-1.51V3a2 2 0 0 
      1 2-2 2 2 0 0 1 
      2 2v.09a1.65 1.65 0 0 
      0 1 1.51 1.65 1.65 0 0 
      0 1.82-.33l.06-.06a2 2 0 0 
      1 2.83 0 2 2 0 0 
      1 0 2.83l-.06.06a1.65 
      1.65 0 0 0-.33 1.82V9a1.65 
      1.65 0 0 0 1.51 1H21a2 2 
      0 0 1 2 2 2 2 0 0 
      1-2 2h-.09a1.65 1.65 0 0 
      0-1.51 1z"></path>
  </svg>
);

const LogOutIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 mr-2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const TopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth(); // get real user
  if (!user) return null;

  const avatarUrl =
    user.photo ||
    `https://placehold.co/100x100/3B82F6/ffffff?text=${
      user.firstName?.[0] || "U"
    }${user.lastName?.[0] || "?"}`;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-8 z-20">
      {/* Left: Company / Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Company Logo" className="h-10 w-auto" />
        </div>
        <div className="hidden sm:block border-l h-8 border-gray-300"></div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-900">
            {user.role?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 relative">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user.firstName}
          </p>
          <p className="text-xs text-gray-500">{user.role?.name}</p>
        </div>
        <BellIcon className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />

        {/* Profile Dropdown */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </button>

        {isDropdownOpen && (
          <div
            className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-2xl py-2 border border-gray-100 z-30"
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}>
            
            <a
              href="#settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <SettingsIcon />
              Settings
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
              <LogOutIcon />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;

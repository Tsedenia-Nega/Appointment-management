import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // modern icons

export default function TopTabs() {
  const { user } = useAuth();
  const location = useLocation();

  // Track which tab is active and mobile menu open state
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  // Update activeTab whenever the route changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Define all possible tabs with their permissions
  const tabs = [
    { name: "DASHBOARD", path: "/dashboard", permission: "view_dashboard" },
    { name: "REQUEST", path: "/pending", permission: "approve_request" },
    { name: "APPOINTMENTS", path: "/view", permission: "view_appointment" },
    { name: "CREATE ACCOUNT", path: "/signup", permission: "manage_roles" },
    { name: "MANAGE", path: "/roles", permission: "manage_roles" },
    { name: "CHECK IN", path: "/checkin", permission: "check_in" },
    { name: "CHECK OUT", path: "/security", permission: "check_out" },
    {
      name: "CREATE APPOINTMENT",
      path: "/create",
      permission: "create_appointment",
    },
  ];

  // Filter based on user’s allowed permissions
  const accessibleTabs = tabs.filter((tab) =>
    user?.role?.permissions?.some((perm) => perm.key === tab.permission)
  );

  return (
    <main className="px-4 md:px-8 lg:px-16 xl:px-24">
      {/* Top Bar with Tabs or Menu Button */}
      <div className="flex items-center justify-between border-b border-gray-200 py-2">
        {/* Desktop Tabs */}
        <div className="hidden md:flex space-x-6">
          {accessibleTabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={() => setActiveTab(tab.path)}
              className={`
                relative 
                px-2 py-3 
                text-sm font-medium uppercase tracking-wider 
                transition-colors duration-200 
                ${
                  activeTab === tab.path
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab.name}
              {/* Blue underline for active tab */}
              {activeTab === tab.path && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transition-all duration-200 ease-in-out"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className="md:hidden mt-2 border border-gray-200 rounded-lg shadow-md bg-white 
                     animate-fade-in-down origin-top transition-all duration-200"
        >
          {accessibleTabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={() => {
                setActiveTab(tab.path);
                setMenuOpen(false);
              }}
              className={`block px-4 py-2 text-sm uppercase tracking-wide transition-colors duration-150 ${
                activeTab === tab.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic content section (below the tabs) */}
      <div className="mt-4">{/* Tab-specific content can go here */}</div>
    </main>
  );
}

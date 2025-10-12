import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useState } from "react";

export default function TopTabs() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const PlusIcon = (props) => (
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
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const tabs = [
    { name: "DASHBOARD", path: "/dashboard", permission: "view_dashboard" },
    { name: "REQUEST", path: "/appointment", permission: "approve_request" },
    { name: "APPOINTMENTS", path: "/view", permission: "view_appointment" },
    { name: "INTEGRITY", path: "/integrity", permission: "manage_integrity" },
    { name: "PENDING", path: "/pending", permission: "approve_request" },
    { name: "CREATE ACCOUNT", path: "/signup", permission: "manage_roles" },
    { name: "MANAGE", path: "/roles", permission: "manage_roles" },
  ];

  const accessibleTabs = tabs.filter((tab) =>
    user?.role?.permissions?.some((perm) => perm.key === tab.permission),
  );

  return (
    <main className="px-4 md:px-8 lg:px-16 xl:px-24">
      {/* Tabs - Left Aligned */}
      <div className="flex border-b border-gray-200  space-x-6">
        {accessibleTabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            onClick={() => setActiveTab(tab.path)}
            className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-semibold transition-colors ${
              activeTab === tab.path
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}>
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Optional Plus Button for Create Account */}
      {activeTab === "/signup" && (
        <div className="flex justify-start mb-4">
          <button className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
            <PlusIcon />
            Create Account
          </button>
        </div>
      )}

      {/* Dynamic Content */}
      <div>{/* Render your tab contents here */}</div>
    </main>
  );
}

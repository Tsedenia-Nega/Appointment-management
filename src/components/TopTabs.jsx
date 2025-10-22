import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  FileText,
  CalendarCheck,
  UserPlus,
  Users,
  ClipboardCheck,
  ClipboardX,
  PlusCircle,
} from "lucide-react";

export default function TopTabs() {
  const { user } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Define all possible tabs with their permissions and an associated icon
  const tabs = [
    {
      name: "Dashboard",
      path: "/dashboard",
      permission: "view_dashboard",
      icon: Home,
    },
    {
      name: "Requests",
      path: "/pending",
      permission: "approve_request",
      icon: FileText,
    },
    {
      name: "Appointments",
      path: "/view",
      permission: "view_appointment",
      icon: CalendarCheck,
    },
    {
      name: "Create Account",
      path: "/signup",
      permission: "manage_roles",
      icon: UserPlus,
    },
    {
      name: "Manage Roles",
      path: "/roles",
      permission: "manage_roles",
      icon: Users,
    },
    {
      name: "Check In",
      path: "/checkin",
      permission: "check_in",
      icon: ClipboardCheck,
    },
    {
      name: "Check Out",
      path: "/security",
      permission: "check_out",
      icon: ClipboardX,
    },
    {
      name: "Create Appointment",
      path: "/create",
      permission: "create_appointment",
      icon: PlusCircle,
    },
  ];

  const accessibleTabs = tabs.filter((tab) =>
    user?.role?.permissions?.some((perm) => perm.key === tab.permission)
  );

  // --- Utility Component for Cleaner Icons ---
  // Updated text colors to work with the new palette
  const TabIcon = ({ Icon, isActive, className = "" }) => (
    <Icon
      size={16}
      className={`
              ${
                isActive
                  ? "text-indigo-800"
                  : "text-gray-500 group-hover:text-indigo-600"
              } 
              transition-colors duration-200 mr-2
              ${className}
          `}
    />
  );
  // -------------------------------------------

  return (
    <div className="mx-auto max-w-7xl">
      <main className="px-4 md:px-8">
        {/* Top Bar Container */}
        <div className="flex items-center justify-between border-b border-gray-200">
          {/* Desktop Tabs: Soft, clean professional look */}
          <nav className="hidden md:flex space-x-1 py-2">
            {accessibleTabs.map((tab) => {
              const isActive = activeTab === tab.path;
              const IconComponent = tab.icon;

              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  onClick={() => setActiveTab(tab.path)}
                  // Standardized font size to text-sm
                  className={`
                                    group flex items-center 
                                    px-4 py-2 
                                    text-m font-medium tracking-tight capitalize
                                    rounded-lg 
                                    transition-all duration-200 ease-in-out
                                    ${
                                      isActive
                                        ? // Active: Teal background, dark text. Calm and professional.
                                          "bg-teal-50 text-indigo-800 shadow-sm font-semibold"
                                        : // Hover: Very subtle background, focused text color.
                                          "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                                    }
                                `}
                >
                  <TabIcon Icon={IconComponent} isActive={isActive} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
          {/* Mobile Menu Button */}
        
          <div className="md:hidden flex items-center justify-between w-full py-3">
            {/* 1. Menu Button (LEFT) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 p-2 rounded-full hover:bg-gray-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors duration-150"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* 2. Current Tab Name (RIGHT) */}
            <h1 className="text-base font-bold text-gray-800 capitalize">
              {accessibleTabs.find((tab) => tab.path === activeTab)?.name ||
                "Navigation"}
            </h1>
          </div>
        </div>

        {/* Mobile Dropdown Menu - Slide-down effect */}
        <div
          className={`
                    md:hidden 
                    absolute top-16 left-0 right-0 z-30 
                    bg-white 
                    shadow-2xl border-b-2 border-indigo-600 {/* Subtle deep indigo border */}
                    transition-all duration-300 ease-in-out
                    overflow-hidden
                    ${
                      menuOpen
                        ? "max-h-screen opacity-100"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }
                `}
        >
          <nav className="p-4 space-y-1">
            {accessibleTabs.map((tab) => {
              const isActive = activeTab === tab.path;
              const IconComponent = tab.icon;

              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  onClick={() => {
                    setActiveTab(tab.path);
                    setMenuOpen(false);
                  }}
                  // Standardized font size to text-base for mobile links
                  className={`
                                    group flex items-center w-full 
                                    px-4 py-3 
                                    text-base font-medium capitalize 
                                    rounded-lg 
                                    transition-colors duration-150 
                                    ${
                                      isActive
                                        ? // Active: Soft slate background with deep indigo border
                                          "bg-slate-100 text-indigo-700 border-l-4 border-indigo-600 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
                                    }
                                `}
                >
                  {/* Increased icon size for mobile readability */}
                  <TabIcon
                    Icon={IconComponent}
                    isActive={isActive}
                    className="w-5 h-5 mr-3"
                  />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="">{/* Tab-specific content can go here */}</div>
      </main>
    </div>
  );
}

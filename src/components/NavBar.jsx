import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import {
  Home,
  FileText,
  CalendarCheck,
  UserPlus,
  Users,
  ClipboardCheck,
  ClipboardX,
  PlusCircle,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.jpg";

export default function SingleNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    workflow: false,
    appointments: false,
    admin: false,
    profile: false, // added profile dropdown
  });

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  if (!user) return null;

  const accessibleTabs = {
    dashboard: user?.role?.permissions?.some((p) => p.key === "view_dashboard"),
    requests: user?.role?.permissions?.some((p) => p.key === "approve_request"),
    checkIn: user?.role?.permissions?.some((p) => p.key === "check_in"),
    checkOut: user?.role?.permissions?.some((p) => p.key === "check_out"),
    viewAppointments: user?.role?.permissions?.some(
      (p) => p.key === "view_appointment"
    ),
    createAppointments: user?.role?.permissions?.some(
      (p) => p.key === "create_appointment"
    ),
    manageRoles: user?.role?.permissions?.some((p) => p.key === "manage_roles"),
    createAccount: user?.role?.permissions?.some(
      (p) => p.key === "manage_roles"
    ),
  };

  const handleLinkClick = (to) => {
    setActiveTab(to);
    setMobileMenuOpen(false);
    setDropdownOpen({
      workflow: false,
      appointments: false,
      admin: false,
      profile: false,
    });
  };

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const TabLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={() => handleLinkClick(to)}
      className={`flex items-center px-5 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 hover:bg-blue-50 ${
        activeTab === to
          ? "bg-blue-100 text-gray-900 font-semibold shadow-md"
          : "text-gray-800"
      } text-sm md:text-base font-medium`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </Link>
  );

  const avatarUrl =
    user.photo ||
    `https://placehold.co/100x100/DBEAFE/3B82F6?text=${user.firstName?.[0]}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-100 via-blue-50 to-white shadow-md border-b border-blue-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 md:px-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-14 w-auto rounded-lg shadow-sm border border-white/50"
          />
          <span className="hidden md:block text-lg md:text-xl font-semibold text-gray-800">
            {user.role?.name}
          </span>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center gap-3">
          {accessibleTabs.dashboard && (
            <TabLink to="/dashboard" icon={Home}>
              Dashboard
            </TabLink>
          )}

          {(accessibleTabs.requests ||
            accessibleTabs.checkIn ||
            accessibleTabs.checkOut) && (
            <div className="relative group">
              <button className="flex items-center gap-1 px-5 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300 text-sm md:text-base font-medium">
                Workflow
                <ChevronDown
                  size={16}
                  className="transition-transform duration-300"
                />
              </button>
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-md border border-blue-100 w-48 transition-all duration-300 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
                {accessibleTabs.requests && (
                  <TabLink to="/pending" icon={FileText}>
                    Requests
                  </TabLink>
                )}
                {accessibleTabs.checkIn && (
                  <TabLink to="/checkin" icon={ClipboardCheck}>
                    Check In
                  </TabLink>
                )}
                {accessibleTabs.checkOut && (
                  <TabLink to="/security" icon={ClipboardX}>
                    Check Out
                  </TabLink>
                )}
              </div>
            </div>
          )}

          {(accessibleTabs.viewAppointments ||
            accessibleTabs.createAppointments) && (
            <div className="relative group">
              <button className="flex items-center gap-1 px-5 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300 text-sm md:text-base font-medium">
                Appointments
                <ChevronDown
                  size={16}
                  className="transition-transform duration-300"
                />
              </button>
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-md border border-blue-100 w-44 transition-all duration-300 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
                {accessibleTabs.viewAppointments && (
                  <TabLink to="/view" icon={CalendarCheck}>
                    View
                  </TabLink>
                )}
                {accessibleTabs.createAppointments && (
                  <TabLink to="/create" icon={PlusCircle}>
                    Create
                  </TabLink>
                )}
              </div>
            </div>
          )}

          {(accessibleTabs.manageRoles || accessibleTabs.createAccount) && (
            <div className="relative group">
              <button className="flex items-center gap-1 px-5 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300 text-sm md:text-base font-medium">
                Admin
                <ChevronDown
                  size={16}
                  className="transition-transform duration-300"
                />
              </button>
              <div className="absolute top-full mt-2 bg-white rounded-lg shadow-md border border-blue-100 w-44 transition-all duration-300 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible">
                {accessibleTabs.manageRoles && (
                  <TabLink to="/roles" icon={Users}>
                    Role Management
                  </TabLink>
                )}
                {accessibleTabs.createAccount && (
                  <TabLink to="/signup" icon={UserPlus}>
                    Create Account
                  </TabLink>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Profile + Mobile Hamburger */}
        <div className="flex items-center gap-3 relative">
          <span className="hidden md:block text-sm md:text-base font-semibold text-gray-800">
            {user.firstName} {user.middleName || ""}
          </span>

          {/* Profile Button */}
          <button
            onClick={() => toggleDropdown("profile")}
            className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center hover:ring-2 hover:ring-blue-200 transition-all duration-300"
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen.profile && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-md border border-blue-100 w-44 z-50 transition-all duration-300">
              <button
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen({ ...dropdownOpen, profile: false });
                }}
                className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-800 hover:bg-blue-50 text-sm md:text-base rounded-md"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-800 hover:bg-blue-50 text-sm md:text-base rounded-md"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-blue-100 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-blue-100">
          <div className="flex flex-col px-4 py-3 gap-1">
            {accessibleTabs.dashboard && (
              <TabLink to="/dashboard" icon={Home}>
                Dashboard
              </TabLink>
            )}

            {(accessibleTabs.requests ||
              accessibleTabs.checkIn ||
              accessibleTabs.checkOut) && (
              <div className="flex flex-col">
                <button
                  onClick={() => toggleDropdown("workflow")}
                  className="flex items-center justify-between px-4 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  Workflow{" "}
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      dropdownOpen.workflow ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                {dropdownOpen.workflow && (
                  <div className="flex flex-col pl-4 mt-1 gap-1">
                    {accessibleTabs.requests && (
                      <TabLink to="/pending" icon={FileText}>
                        Requests
                      </TabLink>
                    )}
                    {accessibleTabs.checkIn && (
                      <TabLink to="/checkin" icon={ClipboardCheck}>
                        Check In
                      </TabLink>
                    )}
                    {accessibleTabs.checkOut && (
                      <TabLink to="/security" icon={ClipboardX}>
                        Check Out
                      </TabLink>
                    )}
                  </div>
                )}
              </div>
            )}

            {(accessibleTabs.viewAppointments ||
              accessibleTabs.createAppointments) && (
              <div className="flex flex-col">
                <button
                  onClick={() => toggleDropdown("appointments")}
                  className="flex items-center justify-between px-4 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  Appointments{" "}
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      dropdownOpen.appointments ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                {dropdownOpen.appointments && (
                  <div className="flex flex-col pl-4 mt-1 gap-1">
                    {accessibleTabs.viewAppointments && (
                      <TabLink to="/view" icon={CalendarCheck}>
                        View
                      </TabLink>
                    )}
                    {accessibleTabs.createAppointments && (
                      <TabLink to="/create" icon={PlusCircle}>
                        Create
                      </TabLink>
                    )}
                  </div>
                )}
              </div>
            )}

            {(accessibleTabs.manageRoles || accessibleTabs.createAccount) && (
              <div className="flex flex-col">
                <button
                  onClick={() => toggleDropdown("admin")}
                  className="flex items-center justify-between px-4 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  Admin{" "}
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      dropdownOpen.admin ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                {dropdownOpen.admin && (
                  <div className="flex flex-col pl-4 mt-1 gap-1">
                    {accessibleTabs.manageRoles && (
                      <TabLink to="/roles" icon={Users}>
                        Role Management
                      </TabLink>
                    )}
                    {accessibleTabs.createAccount && (
                      <TabLink to="/signup" icon={UserPlus}>
                        Create Account
                      </TabLink>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-800 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

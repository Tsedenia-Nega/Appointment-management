import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const { user } = useUser();
  const location = useLocation();
  const can = (priv) => user?.privileges.includes(priv);
  const navItem = (path, label) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded-lg text-sm font-medium ${
        location.pathname === path
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="w-60 h-screen border-r bg-white">
      <div className="p-6 text-lg font-bold text-gray-800">NB System</div>
      <nav className="space-y-1 px-2">
        {navItem("/dashboard", "Dashboard")}
        {can("view_requests") && navItem("/dashboard/request", "Request")}
        {can("create_appointment") &&
          navItem("/dashboard/appointments", "Appointments")}
        {can("integrity_report") &&
          navItem("/dashboard/integrity", "Integrity")}
        {can("manage_accounts") &&
          navItem("/dashboard/manage-accounts", "Manage Accounts")}
      </nav>
    </aside>
  );
}

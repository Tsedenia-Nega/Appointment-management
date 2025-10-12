import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children, requiredPermission }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (
    requiredPermission &&
    !user.role.permissions.some((perm) => perm.key === requiredPermission)
  ) {
    return (
      <div className="p-8 text-center text-red-600">
        You don’t have permission to view this page.
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;

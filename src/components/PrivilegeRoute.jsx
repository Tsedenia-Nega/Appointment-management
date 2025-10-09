import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function PrivilegeRoute({ children, required }) {
  const { user } = useUser();
  if (!user?.privileges.includes(required)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
}

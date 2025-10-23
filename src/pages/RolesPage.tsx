import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import RolePermissions from "./RolePermissions";
import { BACKEND_URL } from "../config";

interface Role {
  id: string;
  name: string;
  permissions: { key: string }[];
}

const RolesPage: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.access_token) return;

    const fetchRoles = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/roles`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch roles");

        const data: Role[] = await res.json();
        setRoles(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-20 text-lg">
        Loading roles...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-red-500 mt-20 text-lg">Error: {error}</p>
    );

  return (
    <div className="">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles
          .filter((role) => role.name !== "CEO") // Exclude CEO
          .map((role) => (
            <div
              key={role.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
            >
              <RolePermissions
                roleName={role.name}
                initialPermissions={role.permissions.map((p) => p.key)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default RolesPage;

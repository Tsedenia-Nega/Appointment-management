import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { PERMISSIONS } from "../permissions";

interface RolePermissionsProps {
  roleName: string;
  initialPermissions: string[];
}

const RolePermissions: React.FC<RolePermissionsProps> = ({
  roleName,
  initialPermissions,
}) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(initialPermissions);

  useEffect(() => {
    setSelected(initialPermissions);
  }, [initialPermissions]);

  const handleChange = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    if (!user?.access_token) return alert("You must be logged in");

    const toGrant = selected.filter((p) => !initialPermissions.includes(p));
    const toRevoke = initialPermissions.filter((p) => !selected.includes(p));

    try {
      if (toGrant.length > 0) {
        const res = await fetch(
          `http://localhost:3000/auth/roles/grant-multiple/${roleName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.access_token}`,
            },
            body: JSON.stringify({ permissionKeys: toGrant }),
          },
        );
        if (!res.ok) throw new Error("Failed to grant permissions");
      }

      if (toRevoke.length > 0) {
        const res = await fetch(
          `http://localhost:3000/auth/roles/revoke-multiple/${roleName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.access_token}`,
            },
            body: JSON.stringify({ permissionKeys: toRevoke }),
          },
        );
        if (!res.ok) throw new Error("Failed to revoke permissions");
      }

      alert("Permissions updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Error updating permissions");
    }
  };

  return (
    <div className="p-4 border rounded-md max-w-md">
      <h2 className="text-lg font-bold mb-2">Role: {roleName}</h2>
      <div className="flex flex-col gap-2">
        {Object.values(PERMISSIONS).map((perm) => (
          <label key={perm} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(perm)}
              onChange={() => handleChange(perm)}
            />
            {perm.replace(/_/g, " ").toUpperCase()}
          </label>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Save Changes
      </button>
    </div>
  );
};

export default RolePermissions;

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determine if the selected permissions differ from the initial state
  const hasChanges =
    JSON.stringify(selected.sort()) !==
    JSON.stringify(initialPermissions.sort());

  useEffect(() => {
    setSelected(initialPermissions);
  }, [initialPermissions]);

  const handleChange = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!user?.access_token) {
      setError("Authentication failed. Please log in.");
      return;
    }

    if (!hasChanges) {
      setMessage("No changes to save.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    const toGrant = selected.filter((p) => !initialPermissions.includes(p));
    const itemsToRevoke = initialPermissions.filter(
      (p) => !selected.includes(p)
    );

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
          }
        );
        if (!res.ok) throw new Error("Failed to grant permissions.");
      }

      if (itemsToRevoke.length > 0) {
        const res = await fetch(
          `http://localhost:3000/auth/roles/revoke-multiple/${roleName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.access_token}`,
            },
            body: JSON.stringify({ permissionKeys: itemsToRevoke }),
          }
        );
        if (!res.ok) throw new Error("Failed to revoke permissions.");
      }

      setMessage("Role permissions updated successfully.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while saving permissions.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to format the permission key into clean, readable text
  const formatPermissionKey = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div
      className="
        animate-fade-in-down
        p-6 // Tighter padding for compactness
         bg-gradient-to-br from-indigo-50 via-white to-purple-50
        shadow-xl 
        rounded-xl 
        max-w-md // Tighter max-width for attractiveness
        w-full 
        mx-auto 
        border 
        border-gray-100
    "
    >
      {/* Header and Context */}
      <p className="text-xl text-blue-600 font-bold mb-4 pb-2 border-b border-gray-200">
        Role: {roleName}
      </p>

      {/* Message Box - Professional Alerts */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border-l-4 border-green-500 rounded font-medium flex items-start shadow-sm">
          <svg
            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            ></path>
          </svg>
          <div>{message}</div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded font-medium flex items-start shadow-sm">
          <svg
            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            ></path>
          </svg>
          <div>{error}</div>
        </div>
      )}

      {/* Permissions List - SCROLL CONTAINER with Aesthetic Inner Shadow and reduced height */}
      <div
        className="
        flex flex-col 
        gap-0.5
        max-h-80 // Reduced Max Height
        overflow-y-auto 
        py-2 
        rounded-lg 
        bg-gray-50 // Contrast background
        shadow-inner // Aesthetic Recessed Look
        p-3 
      "
      >
        {Object.values(PERMISSIONS).map((perm) => {
          const isSelected = selected.includes(perm);
          const isInitial = initialPermissions.includes(perm);
          const isChanged = isSelected !== isInitial;

          return (
            <label
              key={perm}
              className={`
                  flex 
                  items-center 
                  justify-between 
                  px-3 py-2 
                  rounded-md 
                  cursor-pointer 
                  transition-all 
                  duration-300 
                  ease-in-out
                  border border-transparent 
                  transform hover:scale-[1.005] 
                  
                  ${
                    isSelected
                      ? "bg-white border-blue-100 shadow-sm"
                      : "hover:bg-gray-100"
                  }

                `}
            >
              <span
                className={`text-base font-medium ${
                  isChanged ? "text-blue-700" : "text-gray-700"
                } `}
              >
                {formatPermissionKey(perm)}
              </span>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleChange(perm)}
                className="
                    form-checkbox 
                    h-5 w-5 
                    text-blue-600 
                    rounded 
                    focus:ring-blue-500 
                    border-gray-300
                    transition duration-150
                    flex-shrink-0
                  "
              />
            </label>
          );
        })}
      </div>

      {/* Save Button - Loading Animation */}
      <button
        onClick={handleSave}
        className="
          mt-6 
          w-full 
          px-4 
          py-2.5 
          text-lg 
          bg-blue-600 
          text-white 
          font-semibold 
          rounded-lg 
          shadow-md 
          transition 
          duration-150
          flex items-center justify-center
          
          hover:bg-blue-700 
          focus:outline-none 
          focus:ring-2 
          focus:ring-offset-2 
          focus:ring-blue-500 
          
          disabled:bg-gray-400 
          disabled:shadow-none
          disabled:cursor-not-allowed
        "
        disabled={!user?.access_token || !hasChanges || isSaving}
      >
        {isSaving ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </>
        ) : user?.access_token ? (
          "Save Changes"
        ) : (
          "Login Required"
        )}
      </button>
    </div>
  );
};

export default RolePermissions;

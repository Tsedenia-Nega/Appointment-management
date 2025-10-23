import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/useAuth";
import TopNavbar from "../components/NavBar";
import { BACKEND_URL } from "../config";

const InputField = ({ label, value, type = "text", readOnly, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-xs font-semibold text-gray-700">{label}</label>
    <input
      type={type}
      value={value || ""}
      readOnly={readOnly}
      onChange={onChange}
      className={`w-full p-2 border ${
        readOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"
      } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
    />
  </div>
);
const Profile = () => {
  // 1. Initialize useNavigate hook
  const navigate = useNavigate();

  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  const fetchProfile = useCallback(async () => {
    if (!user?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/users`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      const data = await res.json();
      const currentUser = data.find((u) => u.email === user.email);
      setUserData(currentUser);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      // It's crucial to send the ID if the backend doesn't infer it from the token
      const res = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.access_token}`,
        },
        // Send only updateable fields, usually exclude the role/id/email
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setUserData(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    // Render TopNavbar even while loading for consistent UI
    return (
      <>
        <TopNavbar />
        <p className="p-6 pt-24">Loading profile...</p>
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <TopNavbar />
        <p className="p-6 pt-24 text-red-500">User not found.</p>
      </>
    );
  }
  const avatarUrl =
    user.photo ||
    `https://placehold.co/100x100/3B82F6/ffffff?text=${
      userData.firstName?.[0] || "U"
    }${userData.middleName?.[0] || "?"}`;

  return (
    // 3. Main container for the Profile page content
    <div className="min-h-screen  bg-gradient-to-br from-indigo-50 via-white to-purple-50font-sans">
      <TopNavbar />
      <div className="pt-24 px-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="w-full flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {/* Left Column */}
          <div className="w-full md:w-1/3 p-4 bg-white rounded-xl shadow-lg flex flex-col items-center text-center">
            <div className="relative w-36 h-36 mb-4">
              {/* <img
                src={
                  userData.photo ||
                  "https://placehold.co/100x100/3B82F6/ffffff?text=User"
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
              /> */}
              <img
                src={avatarUrl}
                alt="user"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {userData.firstName} {userData.middleName}
            </h2>
            <p className="text-sm text-gray-500">{userData.role?.name}</p>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-2/3 p-6 bg-white rounded-xl shadow-lg relative flex flex-col justify-between">
            <div className="space-y-6 pt-2">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={userData.firstName}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setUserData({ ...userData, firstName: e.target.value })
                  }
                />
                <InputField
                  label="Middle Name"
                  value={userData.middleName}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setUserData({ ...userData, middleName: e.target.value })
                  }
                />
              </div>

              {/* Last Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Last Name"
                  value={userData.lastName}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setUserData({ ...userData, lastName: e.target.value })
                  }
                />
                <InputField
                  label="Phone Number"
                  value={userData.phone}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                />
              </div>

              {/* Gender */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Gender
                </label>
                <div className="flex space-x-6">
                  {["female", "male"].map((g) => (
                    <label key={g} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={userData.gender === g}
                        onChange={() => setUserData({ ...userData, gender: g })}
                        disabled={!isEditing}
                        className="form-radio text-blue-600 h-4 w-4"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="pt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  My Email Address
                </h3>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-inner max-w-sm">
                  <span className="text-sm text-gray-700 font-medium">
                    {userData.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // revert changes
                  }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

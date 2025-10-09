import React, { useState } from "react";
import { FaClock } from "react-icons/fa";

export default function EditAppointment() {
  const [formData, setFormData] = useState({
    firstName: "Lidiya",
    lastName: "Fiker",
    email: "lidiya@gmail.com",
    phone: "+251901234567",
    gender: "Female",
    country: "Ethiopia",
    city: "Addis Abeba",
    organization: "Addis Ababa University",
    occupation: "",
    date: "",
    startHour: "12",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "12",
    endMinute: "00",
    endPeriod: "AM",
    purpose: "Lorem Ipsum",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Updated:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Edit Appointment
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First & Last Name */}
            <div>
              <label className="block text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Phone No</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="+251..."
              />
            </div>
          </div>

          {/* Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-1">Gender:</label>
              <div className="flex items-center">
                <label className="flex items-center mr-4">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Female
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Male
                </label>
              </div>
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Ethiopia">Ethiopia</option>
                <option value="Kenya">Kenya</option>
                <option value="USA">USA</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Addis Abeba">Addis Abeba</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Washington">Washington</option>
              </select>
            </div>
          </div>

          {/* Organization & Occupation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Date & Time in a single line */}
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Time *</label>
              <div className="flex items-center">
                <div className="flex items-center border rounded-lg px-2 py-1 mr-2">
                  <FaClock className="text-gray-500 mr-2" />
                  <select
                    name="startHour"
                    value={formData.startHour}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none"
                  >
                    {[...Array(12).keys()].map((hour) => (
                      <option key={hour + 1} value={hour + 1}>
                        {hour + 1}
                      </option>
                    ))}
                  </select>
                  <span className="mx-1">:</span>
                  <select
                    name="startMinute"
                    value={formData.startMinute}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none"
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                      </option>
                    ))}
                  </select>
                  <select
                    name="startPeriod"
                    value={formData.startPeriod}
                    onChange={handleChange}
                    className="bg-transparent outline-none text-gray-600 ml-2"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
                <span className="self-center">To</span>
                <div className="flex items-center border rounded-lg px-2 py-1 ml-2">
                  <FaClock className="text-gray-500 mr-2" />
                  <select
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none"
                  >
                    {[...Array(12).keys()].map((hour) => (
                      <option key={hour + 1} value={hour + 1}>
                        {hour + 1}
                      </option>
                    ))}
                  </select>
                  <span className="mx-1">:</span>
                  <select
                    name="endMinute"
                    value={formData.endMinute}
                    onChange={handleChange}
                    className="flex-1 bg-transparent outline-none"
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                      </option>
                    ))}
                  </select>
                  <select
                    name="endPeriod"
                    value={formData.endPeriod}
                    onChange={handleChange}
                    className="bg-transparent outline-none text-gray-600 ml-2"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-gray-700 mb-1">Purpose *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 h-24"
              required
            ></textarea>
          </div>

          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

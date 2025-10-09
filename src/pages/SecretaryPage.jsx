import React, { useState, useMemo } from 'react';
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaEllipsisH } from 'react-icons/fa';

// --- Sample Data (Mocked) ---
const mockAppointments = [
  { no: '00001', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: true, security: 'Passed' },
  { no: '00002', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: false, security: 'Pending' },
  { no: '00003', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: false, security: 'Pending' },
  { no: '00004', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: true, security: 'Passed' },
  { no: '00005', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: false, security: 'Pending' },
  { no: '00006', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: true, security: 'Passed' },
  { no: '00007', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: false, security: 'Passed' },
  { no: '00008', name: 'Christine Brooks', email: 'Lidu@gmail.com', date: '04 Sep 2019', phone: '0944725108', checkIn: false, security: 'Pending' },
  // Adding more entries for better pagination demo
  ...Array(20).fill().map((_, i) => ({
      no: `000${i + 9}`, name: `User ${i + 9}`, email: `user${i+9}@app.com`, date: '05 Sep 2019', phone: '0900000000', checkIn: i % 3 === 0, security: i % 2 === 0 ? 'Passed' : 'Pending'
  }))
];

// --- AppointmentRow Component (Inner) ---
const AppointmentRow = ({ appointment }) => {
  const { no, name, email, date, phone, checkIn, security } = appointment;

  const SecurityStatus = ({ status }) => {
    if (status === 'Passed') {
      return (
        <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
          <FaCheckCircle className="mr-1 text-xs" /> Passed
        </span>
      );
    } else {
      // Pending/Dotted status
      return (
        <span className="text-gray-300 text-lg">
          <FaEllipsisH />
        </span>
      );
    }
  };

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="p-4 text-sm text-gray-500">{no}</td>
      <td className="p-4 text-sm font-semibold text-gray-800">{name}</td>
      <td className="p-4 text-sm text-gray-700">{email}</td>
      <td className="p-4 text-sm text-gray-700">{date}</td>
      <td className="p-4 text-sm text-gray-700">{phone}</td>
      <td className="p-4 text-center">
        {/* Custom Checkbox based on the image style */}
        <div 
          className={`w-5 h-5 rounded-full border flex items-center justify-center mx-auto transition-all duration-200 ${
            checkIn 
              ? 'border-blue-500 bg-blue-500' 
              : 'border-gray-300'
          }`}
        >
          {checkIn && <FaCheckCircle className="text-white text-xs" />}
        </div>
      </td>
      <td className="p-4 text-center">
        <SecurityStatus status={security} />
      </td>
    </tr>
  );
};

// --- SecretaryPage Component (Main) ---
const SecretaryPage = () => {
  const [appointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 8;

  // --- Search Filtering Logic ---
  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return appointments.filter(appointment =>
      Object.values(appointment).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [appointments, searchTerm]);

  // --- Pagination Logic ---
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage < 3) endPage = Math.min(totalPages, maxPagesToShow - 2);
    if (currentPage > totalPages - 2) startPage = Math.max(1, totalPages - maxPagesToShow + 3);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i > 0 && i <= totalPages) pageNumbers.push(i);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    // Outer container for the page background
    <div className="bg-gray-50 min-h-screen p-10">
      {/* Main Card Container */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6 md:p-8">
        
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Appointments</h1>

        {/* Header/Controls Row */}
        <div className="flex justify-between items-center mb-6">
          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm hover:bg-gray-50 transition">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            <span className="font-medium">Date</span>
          </button>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['No', 'NAME', 'Email', 'DATE', 'Phone No', 'Check In', 'Security'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentAppointments.length > 0 ? (
                  currentAppointments.map((appointment, index) => (
                      <AppointmentRow key={appointment.no + '-' + index} appointment={appointment} />
                  ))
              ) : (
                  <tr><td colSpan="7" className="py-8 text-center text-gray-500">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &larr; Previous
          </button>

          <div className="flex space-x-2">
            {getPaginationNumbers().map((number, index) => (
              <span
                key={index}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all duration-200 ${
                  number === '...'
                    ? 'text-gray-400 cursor-default'
                    : number === currentPage
                    ? 'bg-blue-500 text-white font-semibold shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                }`}
                onClick={() => typeof number === 'number' && setCurrentPage(number)}
              >
                {number}
              </span>
            ))}
          </div>

          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryPage;
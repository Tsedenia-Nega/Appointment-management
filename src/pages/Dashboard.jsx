// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const data = [
  { name: "Silver", visits: 4 },
  { name: "Platinum", visits: 10 },
  { name: "Gold", visits: 15 },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

          {/* Tabs */}
          <div className="flex space-x-6 border-b mb-8">
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600">
              DASHBOARD
            </button>
            <button className="pb-2 text-gray-500">REQUEST</button>
            <button className="pb-2 text-gray-500">APPOINTMENTS</button>
            <button className="pb-2 text-gray-500">INTEGRITY</button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">Approved</p>
              <h3 className="text-3xl font-bold mt-2">2,420</h3>
              <div className="text-blue-500 mt-3 text-sm">↗</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">Rejected</p>
              <h3 className="text-3xl font-bold mt-2">1,210</h3>
              <div className="text-red-500 mt-3 text-sm">↘</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">Completed</p>
              <h3 className="text-3xl font-bold mt-2">16</h3>
              <div className="text-blue-500 mt-3 text-sm">↗</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4">Analytics Overview</h3>
            {/* <BarChart width={600} height={250} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill="#2563eb" />
            </BarChart> */}
          </div>
        </div>
      </div>
    </div>
  );
}

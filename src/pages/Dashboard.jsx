import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../context/useAuth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    approved: 0,
    rejected: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.access_token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:3000/requests/dashboard", {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  const chartData = {
    labels: ["Approved", "Rejected", "Completed", "Pending"],
    datasets: [
      {
        label: "Requests Count",
        data: [
          data.approved + data.completed,
          data.rejected,
          data.completed,
          data.pending,
        ],
        backgroundColor: ["#4ade80", "#f87171", "#60a5fa", "#fbbf24"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Appointment Requests Status",
        font: { size: 14 },
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="p-10">
      {/* Container: Cards + Chart */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition h-26 flex flex-col justify-center items-center">
            <p className="text-gray-500 text-sm">Approved</p>
            <h3 className="text-xl font-bold mt-1">
              {data.approved + data.completed}
            </h3>
          </div>
          <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition h-26 flex flex-col justify-center items-center">
            <p className="text-gray-500 text-sm">Rejected</p>
            <h3 className="text-xl font-bold mt-1">{data.rejected}</h3>
          </div>
          <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition h-26 flex flex-col justify-center items-center">
            <p className="text-gray-500 text-sm">Completed</p>
            <h3 className="text-xl font-bold mt-1">{data.completed}</h3>
          </div>
          <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition h-26 flex flex-col justify-center items-center">
            <p className="text-gray-500 text-sm">Pending</p>
            <h3 className="text-xl font-bold mt-1">{data.pending}</h3>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-4 w-full lg:w-1/3 h-64">
          <h3 className="font-semibold mb-2 text-center text-sm">
            Analytics Overview
          </h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

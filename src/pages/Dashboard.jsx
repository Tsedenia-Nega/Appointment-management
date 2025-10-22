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
  Legend
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

  if (loading)
    return (
      <p className="p-6 text-gray-600 text-center">Loading dashboard...</p>
    );
  if (error)
    return <p className="p-6 text-red-500 text-center">Error: {error}</p>;

  const chartData = {
    labels: ["Approved", "Rejected", "Completed", "Pending"],
    datasets: [
      {
        label: "Requests Overview",
        data: [
          data.approved + data.completed,
          data.rejected,
          data.completed,
          data.pending,
        ],
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          switch (context.dataIndex) {
            case 0:
              gradient.addColorStop(0, "#34d399");
              gradient.addColorStop(1, "#10b981");
              break;
            case 1:
              gradient.addColorStop(0, "#f87171");
              gradient.addColorStop(1, "#ef4444");
              break;
            case 2:
              gradient.addColorStop(0, "#60a5fa");
              gradient.addColorStop(1, "#3b82f6");
              break;
            case 3:
              gradient.addColorStop(0, "#fbbf24");
              gradient.addColorStop(1, "#f59e0b");
              break;
            default:
              gradient.addColorStop(0, "#a1a1aa");
              gradient.addColorStop(1, "#71717a");
          }
          return gradient;
        },
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: "#6366f1",
        barThickness: 50,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4b5563",
          font: { size: 13, weight: "bold" },
        },
      },
      title: {
        display: true,
        // text: "Visits Overview",
        color: "#1f2937",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#d1d5db",
        borderWidth: 1,
        borderColor: "#374151",
        padding: 10,
        cornerRadius: 10,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", stepSize: 1 },
        grid: { color: "#f3f4f6" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cards Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 flex-1">
          {/* Approved */}
          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center border border-green-100">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <span className="text-green-600 text-xl font-bold">✓</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Approved</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-1">
              {data.approved + data.completed}
            </h3>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <span className="text-red-600 text-xl font-bold">✗</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Rejected</p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">
              {data.rejected}
            </h3>
          </div>

          {/* Completed */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center border border-blue-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-blue-600 text-xl font-bold">✔</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-1">
              {data.completed}
            </h3>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center border border-yellow-100">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
              <span className="text-yellow-600 text-xl font-bold">⏳</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <h3 className="text-3xl font-extrabold text-yellow-600 mt-1">
              {data.pending}
            </h3>
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex-1 lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
              <h3 className="text-white font-semibold text-center text-sm tracking-wide">
                Analytics Overview
              </h3>
            </div>
            <div className="p-6 h-80 bg-white">
              <Bar data={chartData} options={chartOptions} />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

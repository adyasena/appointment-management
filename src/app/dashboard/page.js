"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const loginTime = localStorage.getItem("loginTime");

      if (!token || !loginTime) {
        handleLogout();
        return;
      }

      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (now - parseInt(loginTime) > oneHour) {
        handleLogout();
      }
    };

    const fetchAppointments = async () => {
      try {
        checkSession();

        const res = await fetch("/api/appointments");
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data = await res.json();
        setAppointments(data.appointments);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAppointments();

    const interval = setInterval(checkSession, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Creator ID</th>
            <th className="border border-gray-300 p-2">Start</th>
            <th className="border border-gray-300 p-2">End</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">
                  {appointment.title}
                </td>
                <td className="border border-gray-300 p-2">
                  {appointment.creator_id}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(appointment.start).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(appointment.end).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="border border-gray-300 p-4 text-center"
              >
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

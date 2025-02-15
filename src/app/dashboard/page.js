"use client";
import { useState, useEffect } from "react";
import Select from "react-select";
import { DateTime } from "luxon";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInUserTimezone, setLoggedInUserTimezone] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    start: "",
    end: "",
    participants: [],
  });

  const checkSession = () => {
    const token = localStorage.getItem("token");
    const loginTime = localStorage.getItem("loginTime");

    if (!token || !loginTime) {
      console.log("No token or login expired");
      handleLogout();
      return;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (now - parseInt(loginTime) > oneHour) {
      console.log("Session expired");
      handleLogout();
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded Token:", decodedToken);
        setLoggedInUser(decodedToken.id);
      } catch (error) {
        console.log("Error decoding token:", error);
        handleLogout();
      }
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        checkSession();
        if (!loggedInUser) return;

        const res = await fetch(`/api/appointments?userId=${loggedInUser}`);
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data = await res.json();

        setAppointments(data.appointments);
      } catch (error) {
        alert(error.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const { users } = await res.json();
        setUsers(users);

        const user = users.find((u) => String(u._id) === String(loggedInUser));
        setLoggedInUserTimezone(user?.preferred_timezone || "UTC");
      } catch (error) {
        alert(error.message);
      }
    };

    if (loggedInUser) {
      fetchAppointments();
      fetchUsers();
    }

    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [loggedInUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginTime");
    window.location.href = "/";
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAppointment({ title: "", start: "", end: "", participants: [] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment({ ...newAppointment, [name]: value });
  };

  const handleParticipantChange = (selectedOptions) => {
    setNewAppointment({
      ...newAppointment,
      participants: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    });
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      alert("You need to log in first.");
      return;
    }

    try {
      const appointmentData = {
        ...newAppointment,
        creator_id: loggedInUser,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) throw new Error("Failed to add appointment");

      const data = await res.json();
      const creatorData = users.find(
        (user) => String(user._id) === String(loggedInUser)
      );
      const participantData = data.appointment.participants.map(
        (participantId) => {
          return (
            users.find(
              (user) => String(user._id) === String(participantId)
            ) || { _id: participantId, name: "Unknown" }
          );
        }
      );

      const updatedAppointment = {
        ...data.appointment,
        creator_id: { _id: loggedInUser, name: creatorData?.name || "Unknown" },
        participants: participantData,
      };

      setAppointments([...appointments, updatedAppointment]);
      handleCloseModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const convertToUserTimezone = (utcTime, format = "yyyy-MM-dd HH:mm") => {
    if (!loggedInUserTimezone) return utcTime;
    return DateTime.fromISO(utcTime, { zone: "utc" })
      .setZone(loggedInUserTimezone)
      .toFormat(format);
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Appointment
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300 table-fixed">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 w-2/6">Title</th>
            <th className="border border-gray-300 p-2 w-1/6">Creator</th>
            <th className="border border-gray-300 p-2 w-1/6">Participants</th>
            <th className="border border-gray-300 p-2 w-2/6">Time</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => {
              const date = convertToUserTimezone(
                appointment.start,
                "d MMMM yyyy"
              );
              const startTime = convertToUserTimezone(
                appointment.start,
                "HH:mm"
              );
              const endTime = convertToUserTimezone(appointment.end, "HH:mm");

              return (
                <tr key={appointment._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">
                    {appointment.title}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {appointment.creator_id?.name || "Unknown"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {appointment.participants?.map((p) => p.name).join(", ") ||
                      "None"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {`${date}, ${startTime} - ${endTime}`}
                  </td>
                </tr>
              );
            })
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Appointment</h2>
            <form
              onSubmit={handleAddAppointment}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newAppointment.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  name="start"
                  value={newAppointment.start}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  name="end"
                  value={newAppointment.end}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Participants
                </label>
                <Select
                  isMulti
                  options={users
                    .filter((user) => String(user._id) !== String(loggedInUser))
                    .map((user) => ({ value: user._id, label: user.name }))}
                  onChange={handleParticipantChange}
                  className="w-full"
                  placeholder="Select participants..."
                />
              </div>
              <div className="flex justify-between gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

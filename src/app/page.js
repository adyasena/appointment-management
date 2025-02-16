"use client";
import { useState, useEffect } from "react";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [preferred_timezone, setTimezone] = useState("");
  const [sortedTimezones, setSortedTimezones] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getTimezones = () => {
    const timezones = Intl.supportedValuesOf("timeZone");

    return timezones
      .map((tz) => {
        const now = new Date();
        const offsetString = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "longOffset",
        })
          .formatToParts(now)
          .find((part) => part.type === "timeZoneName")?.value;

        const offset = offsetString
          ? offsetString.match(/GMT([+-]\d+):?(\d+)?/)
          : null;

        const totalOffset =
          offset && offset[1]
            ? parseInt(offset[1], 10) +
              (offset[2] ? parseInt(offset[2], 10) / 60 : 0)
            : 0;

        return { tz, offset: totalOffset };
      })
      .sort((a, b) => a.offset - b.offset)
      .map(({ tz, offset }) => ({
        label: `UTC${offset >= 0 ? "+" : ""}${offset} ${tz}`,
        value: tz,
      }));
  };

  useEffect(() => {
    setSortedTimezones(getTimezones());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    const body = isRegister
      ? { username, name, preferred_timezone, password }
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isRegister) {
        alert("Registration successful. You can now log in.");
        setIsRegister(false);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("loginTime", Date.now());
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full py-8">
      <main className="flex flex-col gap-8 items-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">
          {isRegister ? "Register" : "Login"}
        </h1>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md border border-black/10 p-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          {isRegister && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border border-black/10 p-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="timezone" className="text-sm font-medium">
                  Preferred Timezone
                </label>
                <select
                  id="timezone"
                  value={preferred_timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="rounded-md border border-black/10 p-2 focus:outline-none focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select your preferred timezone
                  </option>
                  {sortedTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-black/10 p-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`rounded-full border border-transparent transition-colors flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 mt-4 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : isRegister ? (
              "Register"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-sm">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </main>
    </div>
  );
}

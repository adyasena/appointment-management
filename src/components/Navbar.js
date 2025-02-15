"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <nav className="bg-blue-600 text-white py-4 px-16">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold flex items-center gap-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="invert"
          />
          <span className="hidden md:block">
            User Appointment Management System
          </span>
        </div>

        <button
          className="md:hidden block text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        <div
          className={`md:flex md:gap-6 absolute md:static bg-blue-600 w-full md:w-auto left-0 top-16 md:top-0 transition-all ${
            isOpen ? "block" : "hidden"
          } md:flex`}
        >
          {isLoggedIn ? (
            <button
              className="block p-3 md:inline md:p-0 hover:underline"
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="https://github.com/adyasena"
              className="block p-3 md:inline md:p-0 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

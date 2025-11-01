"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/attendance", label: "Attendance" },
    { href: "/issues", label: "Issues" },
    { href: "/mess", label: "Mess" },
    { href: "/announcements", label: "Announcements" },
    { href: "/profile", label: "Profile" },
  ];

  const handleLogin = () => router.push("/login");
  const handleSignup = () => router.push("/register");

  return (
    <nav className="bg-blue-600 text-white shadow-md px-6 py-3 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-bold tracking-wide flex items-center gap-1 focus:outline-none"
        >
          DormSync<span className="text-yellow-300">+</span>
        </button>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-yellow-300 transition ${
                  pathname === link.href ? "text-yellow-300" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-3">
          <button
            onClick={handleLogin}
            className="bg-yellow-400 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
          >
            Login
          </button>
          <button
            onClick={handleSignup}
            className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1 focus:outline-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`w-6 h-0.5 bg-white transform transition duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transition duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-white transform transition duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-2 py-2 rounded hover:bg-blue-700 ${
                pathname === link.href ? "bg-blue-700 text-yellow-300" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogin();
            }}
            className="w-full text-left block px-2 py-2 rounded bg-yellow-400 text-blue-700 font-semibold hover:bg-yellow-300"
          >
            Login
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              handleSignup();
            }}
            className="w-full text-left block px-2 py-2 rounded bg-white text-blue-700 font-semibold hover:bg-gray-100"
          >
            Register
          </button>
        </div>
      )}
    </nav>
  );
}

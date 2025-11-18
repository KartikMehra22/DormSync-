"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
      : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

  const getErrorMessage = (err, fallback = "Registration failed ❌") => {
    if (err.response?.data?.ERROR) return err.response.data.ERROR;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message?.includes("timeout")) return "Request timed out. Try again.";
    if (err.request) return "No response from server. Check your network.";
    return fallback;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirm_password) {
      setLoading(false);
      toast.error("❌ Passwords do not match");
      setMessage("❌ Passwords do not match");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirm_password,
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      });

      setLoading(false);

      if (res.status === 201 || res.data?.message?.includes("success")) {
        toast.success("✅ Registration successful! Redirecting...");
        setMessage("✅ Registration successful! Redirecting...");

        setFormData({
          name: "",
          username: "",
          email: "",
          password: "",
          confirm_password: "",
        });

        setTimeout(() => router.push("/login"), 1200);
      } 
      else {
        const msg = res.data?.ERROR || "Registration failed ❌";
        toast.error(`❌ ${msg}`);
        setMessage(`❌ ${msg}`);
      }
    } 
    catch (err) {
      const msg = getErrorMessage(err);
      console.error("Register error:", err);
      setLoading(false);
      toast.error(`❌ ${msg}`);
      setMessage(`❌ ${msg}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-50 px-4 relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-pink-100">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Create your <span className="text-pink-600">Messia</span> account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="john_doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-pink-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

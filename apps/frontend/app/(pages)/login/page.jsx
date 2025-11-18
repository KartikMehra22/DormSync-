"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [formData, setFormData] = useState({
    input: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
      : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

  const getErrorMessage = (err, fallback = "Login failed ❌") => {
    if (err.response?.data?.ERROR) return err.response.data.ERROR;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message?.includes("timeout")) return "Request timed out. Try again.";
    if (err.request) return "No response from server. Check your network.";
    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const input = formData.input.trim();
    const password = formData.password.trim();

    if (!input || !password) {
      setMessage("⚠️ Email/Username and Password are required");
      toast.error("⚠️ Email/Username and Password are required");
      setLoading(false);
      return;
    }

    const payload = {
      password,
      ...(input.includes("@")
        ? { email: input.toLowerCase() }
        : { username: input.toLowerCase() }),
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      });

      setLoading(false);

      if (res.data?.token) {
        login(res.data.token);
        toast.success("✅ Login successful! Redirecting...");
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => router.push("/profile"), 1200);
      } 
      else {
        toast.error("Unexpected response format ❌");
        setMessage("Unexpected response format ❌");
      }
    } 
    catch (err) {
      setLoading(false);
      const errorMessage = getErrorMessage(err);
      console.error("Login error:", err);
      toast.error(`❌ ${errorMessage}`);
      setMessage(`❌ ${errorMessage}`);
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
          Welcome Back to <span className="text-pink-600">Messia</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email or Username
            </label>
            <input
              type="text"
              name="input"
              required
              value={formData.input}
              onChange={handleChange}
              placeholder="you@example.com or john_doe"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.includes("✅")
                ? "text-green-600"
                : "text-red-600 font-medium"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-pink-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;


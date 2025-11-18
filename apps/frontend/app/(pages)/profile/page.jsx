"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  UserCircle2,
  LogOut,
  ArrowLeft,
  Save,
  X,
  Edit,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

export default function Profile() {
  const { token, isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", gender: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
      : process.env.NEXT_PUBLIC_BACKEND_LOCAL_URL;

  const getErrorMessage = (err, fallback = "Something went wrong ❌") => {
    if (err?.response?.data?.ERROR) return err.response.data.ERROR;
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message?.includes("timeout")) return "Request timed out. Try again.";
    if (err?.request) return "No response from server. Check your network.";
    return fallback;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to access your profile.");
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        });

        if (res.data?.user) {
          setUser(res.data.user);
          setFormData({
            name: res.data.user.name || "",
            username: res.data.user.username || "",
            gender: res.data.user.gender || "",
          });
        } else {
          toast.error("Invalid response format ❌");
          setMessage("Invalid response format ❌");
        }
      } catch (err) {
        const msg = getErrorMessage(err, "Error fetching profile");
        console.error("Profile fetch error:", err);
        setMessage(`❌ ${msg}`);
        if (err?.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          router.push("/login");
        } else {
          toast.error(`❌ ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, BASE_URL, logout, router]);

  const handleLogout = () => {
    logout();
    toast.success("You’ve been logged out successfully 👋");
    router.push("/");
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await axios.put(`${BASE_URL}/api/auth/update`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        timeout: 8000,
      });

      if (res.data?.user) {
        setUser(res.data.user);
        setEditing(false);
        toast.success("✅ Profile updated successfully!");
        setMessage("✅ Profile updated successfully!");
      } else {
        const msg = res.data?.ERROR || "Failed to update profile ❌";
        toast.error(msg);
        setMessage(`❌ ${msg}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Error updating profile");
      console.error("Update error:", err);
      toast.error(`❌ ${msg}`);
      setMessage(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 text-gray-600">
        <div className="animate-pulse text-center">
          <p className="text-lg font-medium text-pink-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
        <p className="text-lg">No profile data found ❌</p>
        <button onClick={() => router.push("/login")} className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-50 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-2 border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 h-36 relative flex items-end justify-center">
          <div className="absolute -bottom-10 w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
            <UserCircle2 size={60} className="text-pink-600" />
          </div>
        </div>

        <div className="pt-16 pb-10 px-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 mt-1">@{user.username}</p>

          <p className="mt-4 text-sm text-gray-500 italic">“Organize, connect, live better — DormSync”</p>

          {message && <p className={`text-center mt-4 text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}

          {!editing ? (
            <>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={18} className="text-pink-600" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <User size={18} className="text-pink-600" />
                  <span>{user.gender || "Prefer not to say"}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={18} className="text-pink-600" />
                  <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="font-medium text-pink-600 uppercase">{user.role || "USER"}</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setEditing(true)} className="bg-pink-600 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 transition flex items-center gap-2">
                  <Edit size={18} />
                  Edit Profile
                </button>
                <button onClick={() => router.push("/orders")} className="border border-pink-600 text-pink-600 px-6 py-2.5 rounded-lg hover:bg-pink-50 transition">
                  View My Orders
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="mt-8 max-w-md mx-auto space-y-5 text-left">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button type="submit" disabled={saving} className="bg-pink-600 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 transition flex items-center gap-2 disabled:opacity-60">
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="border border-gray-400 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

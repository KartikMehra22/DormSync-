"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, User, Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ProfilePage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        rollNumber: "",
        phoneNumber: "",
        department: "",
        year: "",
        emergencyContact: "",
        bloodGroup: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await api.profile.getProfile(token);
            setProfile(res.profile);
            if (res.profile) {
                setFormData({
                    rollNumber: res.profile.rollNumber || "",
                    phoneNumber: res.profile.phoneNumber || "",
                    department: res.profile.department || "",
                    year: res.profile.year?.toString() || "",
                    emergencyContact: res.profile.emergencyContact || "",
                    bloodGroup: res.profile.bloodGroup || "",
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.profile.updateProfile(token, {
                ...formData,
                year: formData.year ? parseInt(formData.year) : null,
            });
            toast.success("Profile updated successfully!");
            setEditing(false);
            loadProfile();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to update profile");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-pink-100 rounded-lg transition"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                            <p className="text-gray-600">View and manage your profile</p>
                        </div>
                    </div>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                        >
                            <Edit2 size={20} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                            >
                                <Save size={20} />
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    loadProfile();
                                }}
                                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* User Info Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                                    <User size={40} className="text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                    <p className="text-gray-600">{user?.email}</p>
                                    <p className="text-sm text-gray-500">@{user?.username}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-gray-600 text-sm">Role</p>
                                    <p className="font-medium text-gray-800">{user?.role}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Mess Credits</p>
                                    <p className="font-medium text-pink-600">₹{user?.credits || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Roll Number</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.rollNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, rollNumber: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2.5">{profile?.rollNumber || "-"}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phoneNumber: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2.5">{profile?.phoneNumber || "-"}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Department</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) =>
                                                setFormData({ ...formData, department: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2.5">{profile?.department || "-"}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Year</label>
                                    {editing ? (
                                        <select
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    ) : (
                                        <p className="text-gray-800 py-2.5">
                                            {profile?.year ? `${profile.year}${profile.year === 1 ? "st" : profile.year === 2 ? "nd" : profile.year === 3 ? "rd" : "th"} Year` : "-"}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Blood Group</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.bloodGroup}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bloodGroup: e.target.value })
                                            }
                                            placeholder="e.g., O+"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2.5">{profile?.bloodGroup || "-"}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Emergency Contact</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            value={formData.emergencyContact}
                                            onChange={(e) =>
                                                setFormData({ ...formData, emergencyContact: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 py-2.5">{profile?.emergencyContact || "-"}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

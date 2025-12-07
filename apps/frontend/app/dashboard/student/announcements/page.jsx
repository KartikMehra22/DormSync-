"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Bell, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AnnouncementsPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <AnnouncementsContent />
        </ProtectedRoute>
    );
}

function AnnouncementsContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await api.announcement.getAll();
            setAnnouncements(res.announcements || []);
        } catch (error) {
            console.error("Error loading announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case "EMERGENCY":
                return "bg-red-100 text-red-700";
            case "EVENT":
                return "bg-purple-100 text-purple-700";
            case "HOSTEL":
                return "bg-blue-100 text-blue-700";
            case "MESS":
                return "bg-green-100 text-green-700";
            case "MAINTENANCE":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-pink-100 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
                        <p className="text-gray-600">Important updates and notices</p>
                    </div>
                </div>

                {/* Announcements List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md border border-pink-100 text-center">
                        <Bell size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No announcements yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white p-6 rounded-xl shadow-md border ${announcement.priority
                                        ? "border-pink-300 shadow-lg"
                                        : "border-pink-100"
                                    } hover:shadow-lg transition`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {announcement.priority && (
                                            <Pin size={20} className="text-pink-600" />
                                        )}
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {announcement.title}
                                        </h3>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                            announcement.category
                                        )}`}
                                    >
                                        {announcement.category}
                                    </span>
                                </div>

                                <p className="text-gray-700 mb-4 whitespace-pre-line">
                                    {announcement.content}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                                    <span>
                                        Posted by {announcement.author?.name} ({announcement.author?.role})
                                    </span>
                                    <span>
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

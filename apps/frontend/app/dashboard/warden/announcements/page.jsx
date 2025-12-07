"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Plus, Edit2, Trash2, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WardenAnnouncementsPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <AnnouncementsContent />
        </ProtectedRoute>
    );
}

function AnnouncementsContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "GENERAL",
        priority: false,
        expiresAt: "",
    });

    const categories = ["GENERAL", "HOSTEL", "MESS", "MAINTENANCE", "EVENT", "EMERGENCY"];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const data = {
                ...formData,
                expiresAt: formData.expiresAt || null,
            };

            if (editingId) {
                await api.announcement.update(token, editingId, data);
                toast.success("Announcement updated!");
            } else {
                await api.announcement.create(token, data);
                toast.success("Announcement created!");
            }

            setFormData({ title: "", content: "", category: "GENERAL", priority: false, expiresAt: "" });
            setShowForm(false);
            setEditingId(null);
            loadAnnouncements();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to save announcement");
        }
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            category: announcement.category,
            priority: announcement.priority,
            expiresAt: announcement.expiresAt
                ? new Date(announcement.expiresAt).toISOString().split("T")[0]
                : "",
        });
        setEditingId(announcement.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            const token = localStorage.getItem("token");
            await api.announcement.delete(token, id);
            toast.success("Announcement deleted");
            loadAnnouncements();
        } catch (error) {
            toast.error("Failed to delete announcement");
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case "EMERGENCY": return "bg-red-100 text-red-700";
            case "EVENT": return "bg-purple-100 text-purple-700";
            case "HOSTEL": return "bg-blue-100 text-blue-700";
            case "MESS": return "bg-green-100 text-green-700";
            case "MAINTENANCE": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-blue-100 rounded-lg transition">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
                            <p className="text-gray-600">Create and manage announcements</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ title: "", content: "", category: "GENERAL", priority: false, expiresAt: "" });
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                    >
                        <Plus size={20} /> New Announcement
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Announcement" : "Create Announcement"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Content *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Expires On</label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.checked })}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <span className="text-gray-700 font-medium">Pin to top</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition">
                                    {editingId ? "Update" : "Create"} Announcement
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingId(null); }}
                                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Announcements List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <p className="text-gray-500">No announcements yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white p-6 rounded-xl shadow-md border ${announcement.priority ? "border-blue-300" : "border-blue-100"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {announcement.priority && <Pin size={20} className="text-blue-600" />}
                                        <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                                            {announcement.category}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(announcement)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4 whitespace-pre-line">{announcement.content}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                                    <span>Posted on {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                    {announcement.expiresAt && (
                                        <span className="text-orange-600">
                                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

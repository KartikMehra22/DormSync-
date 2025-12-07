"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Plus, Search, MessageSquare, Clock, Info, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ComplaintsPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ComplaintsContent />
        </ProtectedRoute>
    );
}

function ComplaintsContent() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showNewForm, setShowNewForm] = useState(false);
    const [newIssue, setNewIssue] = useState({
        title: "",
        description: "",
        category: "MAINTENANCE",
        priority: "MEDIUM",
    });

    useEffect(() => {
        loadIssues();
    }, []);

    const loadIssues = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await api.issue.getMyIssues(token);
            setIssues(res.issues || []);
        } catch (error) {
            console.error("Error loading issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.issue.createIssue(token, newIssue);
            toast.success("Complaint submitted successfully");
            setNewIssue({ title: "", description: "", category: "MAINTENANCE", priority: "MEDIUM" });
            setShowNewForm(false);
            loadIssues();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to submit complaint");
        }
    };

    const stats = {
        total: issues.length,
        pending: issues.filter(i => i.status === "PENDING").length,
        inProgress: issues.filter(i => i.status === "IN_PROGRESS").length,
        resolved: issues.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length,
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "ALL" || issue.category === categoryFilter;
        const matchesStatus = statusFilter === "ALL" || issue.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getStatusColor = (status) => {
        if (status === "PENDING") return { bg: "bg-yellow-100", text: "text-yellow-700" };
        if (status === "IN_PROGRESS") return { bg: "bg-blue-100", text: "text-blue-700" };
        if (status === "RESOLVED" || status === "CLOSED") return { bg: "bg-green-100", text: "text-green-700" };
        return { bg: "bg-gray-100", text: "text-gray-700" };
    };

    const getPriorityColor = (priority) => {
        if (priority === "URGENT" || priority === "HIGH") return { bg: "bg-red-100", text: "text-red-700" };
        if (priority === "MEDIUM") return { bg: "bg-orange-100", text: "text-orange-700" };
        return { bg: "bg-gray-100", text: "text-gray-700" };
    };

    const getStatusIcon = (status) => {
        if (status === "PENDING") return <Clock size={20} />;
        if (status === "IN_PROGRESS") return <Info size={20} />;
        return <CheckCircle size={20} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Complaints</h2>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    <Plus size={20} />
                    New Complaint
                </button>
            </div>

            {/* New Complaint Form */}
            {showNewForm && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">Submit New Complaint</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={newIssue.category}
                                    onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="ELECTRICAL">Electrical</option>
                                    <option value="PLUMBING">Plumbing</option>
                                    <option value="CLEANING">Cleaning</option>
                                    <option value="FURNITURE">Furniture</option>
                                    <option value="INTERNET">Internet</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={newIssue.priority}
                                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={newIssue.title}
                                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                placeholder="Brief description of the issue"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                rows={4}
                                required
                                value={newIssue.description}
                                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                placeholder="Detailed description of the issue"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Submit Complaint
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewForm(false)}
                                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Complaints</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <MessageSquare className="text-blue-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                        </div>
                        <Clock className="text-yellow-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">In Progress</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
                        </div>
                        <Info className="text-blue-600" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Resolved</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
                        </div>
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="ELECTRICAL">Electrical</option>
                        <option value="PLUMBING">Plumbing</option>
                        <option value="CLEANING">Cleaning</option>
                        <option value="FURNITURE">Furniture</option>
                        <option value="INTERNET">Internet</option>
                        <option value="OTHER">Other</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No complaints found</p>
                    </div>
                ) : (
                    filteredIssues.map((issue) => {
                        const statusColor = getStatusColor(issue.status);
                        const priorityColor = getPriorityColor(issue.priority);
                        const StatusIcon = getStatusIcon(issue.status);

                        return (
                            <div key={issue.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{issue.title}</h3>
                                    <p className="text-gray-600">{issue.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`flex items-center gap-1 px-3 py-1 ${statusColor.bg} ${statusColor.text} rounded-full text-sm font-medium`}>
                                        {issue.status === "IN_PROGRESS" ? "In Progress" : issue.status.charAt(0) + issue.status.slice(1).toLowerCase()}
                                    </span>
                                    <span className={`px-3 py-1 ${priorityColor.bg} ${priorityColor.text} rounded-full text-sm font-medium`}>
                                        {issue.priority === "HIGH" ? "High Priority" : issue.priority.charAt(0) + issue.priority.slice(1).toLowerCase() + " Priority"}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {issue.category.charAt(0) + issue.category.slice(1).toLowerCase()}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <span>Student: {issue.user?.name || "You"}</span>
                                    <span className="mx-2">•</span>
                                    <span>Room: {issue.user?.profile?.roomNumber || "N/A"}</span>
                                    <span className="mx-2">•</span>
                                    <span>Date: {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

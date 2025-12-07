"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WardenIssuesPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <IssuesContent />
        </ProtectedRoute>
    );
}

function IssuesContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState("PENDING");
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        loadIssues();
    }, [filter]);

    const loadIssues = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = filter !== "ALL" ? { status: filter } : {};
            const res = await api.issue.getAllIssues(token, params);
            setIssues(res.issues || []);
        } catch (error) {
            console.error("Error loading issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (issueId) => {
        try {
            const token = localStorage.getItem("token");
            await api.issue.resolveIssue(token, issueId, "Issue resolved by warden");
            toast.success("Issue resolved!");
            loadIssues();
            setSelectedIssue(null);
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to resolve issue");
        }
    };

    const handleUpdateStatus = async (issueId, status) => {
        try {
            const token = localStorage.getItem("token");
            await api.issue.updateStatus(token, issueId, { status });
            toast.success(`Status updated to ${status}`);
            loadIssues();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-700";
            case "RESOLVED":
                return "bg-green-100 text-green-700";
            case "CLOSED":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "URGENT": return "text-red-600";
            case "HIGH": return "text-orange-600";
            case "MEDIUM": return "text-yellow-600";
            case "LOW": return "text-green-600";
            default: return "text-gray-600";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-blue-100 rounded-lg transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Issue Management</h1>
                        <p className="text-gray-600">Resolve student complaints and issues</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    {["PENDING", "IN_PROGRESS", "RESOLVED", "ALL"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-blue-50"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Issues List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No issues found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {issues.map((issue) => (
                            <div key={issue.id} className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{issue.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{issue.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-500">
                                                <span className="font-medium">{issue.user?.name}</span> - {issue.user?.email}
                                            </span>
                                            <span className="text-gray-500">|</span>
                                            <span className="text-gray-500">Category: <span className="font-medium">{issue.category}</span></span>
                                            <span className={`font-medium ${getPriorityColor(issue.priority)}`}>
                                                Priority: {issue.priority}
                                            </span>
                                            <span className="text-gray-500">{new Date(issue.reportedAt).toLocaleDateString()}</span>
                                            {issue.user.roomAllocation && (
                                                <>
                                                    <span className="text-gray-500">|</span>
                                                    <span className="text-gray-500">
                                                        Room: {issue.user.roomAllocation.room.block.name} - {issue.user.roomAllocation.room.roomNumber}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 border-t border-gray-200 pt-4">
                                    {issue.status === "PENDING" && (
                                        <button
                                            onClick={() => handleUpdateStatus(issue.id, "IN_PROGRESS")}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            <Clock className="inline mr-1" size={16} /> Mark In Progress
                                        </button>
                                    )}
                                    {issue.status !== "RESOLVED" && issue.status !== "CLOSED" && (
                                        <button
                                            onClick={() => handleResolve(issue.id)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            <CheckCircle className="inline mr-1" size={16} /> Resolve
                                        </button>
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

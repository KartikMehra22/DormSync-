"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Search } from "lucide-react";
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

    // Filters & Pagination State
    const [filter, setFilter] = useState("ALL"); // Status Filter
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState("reportedAt");
    const [order, setOrder] = useState("desc");
    const [totalPages, setTotalPages] = useState(1);

    const [selectedIssue, setSelectedIssue] = useState(null);

    // Debounce Search & Load
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadIssues();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [filter, searchTerm, page, sortBy, order]);

    const loadIssues = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const params = {
                page,
                limit,
                search: searchTerm,
                sortBy,
                order
            };

            if (filter !== "ALL") params.status = filter;

            const res = await api.issue.getAllIssues(token, params);
            setIssues(res.issues || []);

            if (res.pagination) {
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error loading issues:", error);
            // toast.error("Failed to load issues"); // Optional: prevent spam on type
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
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
            case "RESOLVED": return "bg-green-100 text-green-700";
            case "CLOSED": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "URGENT": return "text-red-600 font-bold";
            case "HIGH": return "text-orange-600 font-bold";
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

                {/* Controls Area */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
                    {/* Top Row: Search & Sort */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search title, description, student..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="reportedAt">Date Reported</option>
                                <option value="priority">Priority</option>
                                <option value="status">Status</option>
                            </select>
                            <button
                                onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                            >
                                {order === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Status Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => { setFilter(status); setPage(1); }}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${filter === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status === "ALL" ? "All Issues" : status.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Issues List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md text-center">
                        <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No issues found matching your criteria</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            {issues.map((issue) => (
                                <div key={issue.id} className="bg-white p-6 rounded-xl shadow-md border border-blue-100 transition hover:shadow-lg">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800">{issue.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{issue.description}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                                <span className="text-gray-500">
                                                    <span className="font-medium text-gray-700">{issue.user?.name}</span> ({issue.user?.roomAllocation?.room?.block?.name} - {issue.user?.roomAllocation?.room?.roomNumber})
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-gray-500">Cat: <span className="font-medium">{issue.category}</span></span>
                                                <span className="text-gray-300">|</span>
                                                <span className={`${getPriorityColor(issue.priority)}`}>
                                                    {issue.priority} Priority
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <Clock size={14} /> {new Date(issue.reportedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 border-t border-gray-200 pt-4">
                                        {issue.status === "PENDING" && (
                                            <button
                                                onClick={() => handleUpdateStatus(issue.id, "IN_PROGRESS")}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                                            >
                                                <Clock size={16} /> Mark In Progress
                                            </button>
                                        )}
                                        {issue.status !== "RESOLVED" && issue.status !== "CLOSED" && (
                                            <button
                                                onClick={() => handleResolve(issue.id)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Resolve Issue
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <span className="text-sm text-gray-600">Page <b>{page}</b> of <b>{totalPages}</b></span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

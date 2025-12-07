"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Building2, DoorOpen, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WardenRoomsPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <RoomsContent />
        </ProtectedRoute>
    );
}

function RoomsContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("rooms");
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (activeTab === "rooms") loadRooms();
        else if (activeTab === "requests") loadRequests();
    }, [activeTab]);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const res = await api.room.getAllRooms();
            setRooms(res.rooms || []);
        } catch (error) {
            console.error("Error loading rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await api.room.getAllRequests(token);
            setRequests(res.requests || []);
        } catch (error) {
            console.error("Error loading requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await api.room.approveRequest(token, id, "Request approved by warden");
            toast.success("Request approved!");
            loadRequests();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to approve");
        }
    };

    const handleRejectRequest = async (id) => {
        const remarks = prompt("Enter reason for rejection:");
        if (!remarks) return;
        try {
            const token = localStorage.getItem("token");
            await api.room.rejectRequest(token, id, remarks);
            toast.success("Request rejected");
            loadRequests();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to reject");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE": return "bg-green-100 text-green-700";
            case "OCCUPIED": return "bg-blue-100 text-blue-700";
            case "MAINTENANCE": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
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
                        <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
                        <p className="text-gray-600">Manage rooms and allocations</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "rooms"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        <Building2 className="inline mr-2" size={20} />
                        All Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "requests"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        <DoorOpen className="inline mr-2" size={20} />
                        Room Requests
                    </button>
                </div>

                {/* Rooms Tab */}
                {activeTab === "rooms" && (
                    <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
                                <p>No rooms found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Block</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Room</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Floor</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Capacity</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Occupied</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id} className="border-b border-gray-100 hover:bg-blue-50">
                                                <td className="py-3 px-4 font-medium">{room.block?.name}</td>
                                                <td className="py-3 px-4">{room.roomNumber}</td>
                                                <td className="py-3 px-4">{room.floor}</td>
                                                <td className="py-3 px-4">{room.capacity}</td>
                                                <td className="py-3 px-4">
                                                    <span className={room.occupied >= room.capacity ? "text-red-600 font-medium" : "text-green-600"}>
                                                        {room.occupied}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.status)}`}>
                                                        {room.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {room.allocations && room.allocations.length > 0 ? (
                                                        <div className="text-sm">
                                                            {room.allocations.map((alloc, idx) => (
                                                                <div key={idx} className="text-gray-600">
                                                                    {alloc.user?.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Empty</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === "requests" && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-md text-center">
                                <DoorOpen size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No room requests</p>
                            </div>
                        ) : (
                            requests.map((request) => (
                                <div key={request.id} className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800">{request.user?.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                        request.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                            "bg-red-100 text-red-700"
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{request.user?.email}</p>
                                            <p className="text-gray-700 mb-3">
                                                <span className="font-medium">Reason:</span> {request.reason}
                                            </p>
                                            {request.requestedRoom && (
                                                <p className="text-gray-600 text-sm">
                                                    Requested: {request.requestedRoom.block?.name} - Room {request.requestedRoom.roomNumber}
                                                </p>
                                            )}
                                            <p className="text-gray-500 text-sm mt-2">
                                                Requested on {new Date(request.requestedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {request.status === "PENDING" && (
                                        <div className="flex gap-3 border-t border-gray-200 pt-4">
                                            <button
                                                onClick={() => handleApproveRequest(request.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                            >
                                                <CheckCircle size={18} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

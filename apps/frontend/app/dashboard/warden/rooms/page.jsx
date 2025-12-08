"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Building2, DoorOpen, UserPlus, CheckCircle, XCircle, Plus, Trash2, Edit2 } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState("blocks"); // Default to blocks to encourage setup
    const [loading, setLoading] = useState(false);

    // Data
    const [rooms, setRooms] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [requests, setRequests] = useState([]);

    // Modals
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);

    // Forms
    const [newBlock, setNewBlock] = useState({ name: "", totalFloors: "" });
    const [newRoom, setNewRoom] = useState({
        blockId: "",
        floor: "",
        count: "",
        capacity: 2,
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (activeTab === "rooms") loadRooms();
        else if (activeTab === "requests") loadRequests();
        else if (activeTab === "blocks") loadBlocks();
    }, [activeTab]);

    const loadBlocks = async () => {
        try {
            setLoading(true);
            const res = await api.room.getAllBlocks();
            setBlocks(res.blocks || []);
        } catch (error) {
            console.error("Error loading blocks:", error);
            toast.error("Failed to load blocks");
        } finally {
            setLoading(false);
        }
    };

    const loadRooms = async () => {
        try {
            setLoading(true);
            const res = await api.room.getAllRooms(); // Assuming backend supports filter if needed
            setRooms(res.rooms || []);
            // Also load blocks for filter/display if needed, or rely on separate call
            if (blocks.length === 0) loadBlocks();
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

    const handleAddBlock = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            await api.room.createBlock(token, newBlock);
            toast.success("Block created successfully");
            setShowBlockModal(false);
            setNewBlock({ name: "", totalFloors: "" });
            loadBlocks();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to create block");
        } finally {
            setCreating(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await api.room.createBulkRooms(token, newRoom);

            toast.success(res.message || "Rooms created successfully");
            if (res.skippedRooms?.length > 0) {
                toast(`Skipped ${res.skippedRooms.length} existing rooms`, { icon: 'ℹ️' });
            }

            setShowRoomModal(false);
            setNewRoom({
                blockId: "",
                floor: "",
                count: "",
                capacity: 2,
            });
            loadRooms();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to create rooms");
        } finally {
            setCreating(false);
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
                        <p className="text-gray-600">Manage blocks, rooms and allocations</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("blocks")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "blocks"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        <Building2 className="inline mr-2" size={20} />
                        Hostel Blocks
                    </button>
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "rooms"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        <DoorOpen className="inline mr-2" size={20} />
                        Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "requests"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        <UserPlus className="inline mr-2" size={20} />
                        Requests
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden min-h-[400px]">

                    {/* Blocks Tab */}
                    {activeTab === "blocks" && (
                        <div className="p-6">
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setShowBlockModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    <Plus size={20} />
                                    Add Block
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blocks.map((block) => (
                                        <div key={block.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 hover:border-blue-200 transition">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                    <Building2 size={24} />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{block.name}</h3>
                                            <p className="text-gray-500 text-sm">Floors: {block.totalFloors}</p>
                                        </div>
                                    ))}
                                    {blocks.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            <p>No blocks found. Create one to get started.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rooms Tab */}
                    {activeTab === "rooms" && (
                        <div className="p-6">
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setShowRoomModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                >
                                    <Plus size={20} />
                                    Add Room
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
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
                                        <tbody className="divide-y divide-gray-100">
                                            {rooms.map((room) => (
                                                <tr key={room.id} className="hover:bg-blue-50">
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
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(room.status)}`}>
                                                            {room.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {room.allocations?.map(a => a.user?.name).join(", ") || "-"}
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
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No room requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map((request) => (
                                        <div key={request.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-800">{request.user?.name}</p>
                                                    <p className="text-sm text-gray-600">{request.reason}</p>
                                                    <p className="text-xs text-blue-600 mt-1">Requested: {request.requestedRoom?.block?.name} - {request.requestedRoom?.roomNumber}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {request.status === "PENDING" && (
                                                        <>
                                                            <button onClick={() => handleApproveRequest(request.id)} className="text-green-600 hover:text-green-800 font-medium text-sm">Approve</button>
                                                            <button onClick={() => handleRejectRequest(request.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Reject</button>
                                                        </>
                                                    )}
                                                    {request.status !== "PENDING" && (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${request.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                            {request.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Add New Block</h3>
                        <form onSubmit={handleAddBlock}>
                            <input
                                type="text"
                                placeholder="Block Name (e.g. Block A)"
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                                value={newBlock.name}
                                onChange={e => setNewBlock({ ...newBlock, name: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Total Floors"
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                                value={newBlock.totalFloors}
                                onChange={e => setNewBlock({ ...newBlock, totalFloors: e.target.value })}
                                required
                            />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowBlockModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRoomModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Add Multiple Rooms</h3>
                        <form onSubmit={handleAddRoom}>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                                value={newRoom.blockId}
                                onChange={e => setNewRoom({ ...newRoom, blockId: e.target.value })}
                                required
                            >
                                <option value="">Select Block</option>
                                {blocks.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">Floor Number</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1 for First Floor"
                                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newRoom.floor}
                                    onChange={e => setNewRoom({ ...newRoom, floor: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">Number of Rooms</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 10 (creates 101-110)"
                                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newRoom.count}
                                    onChange={e => setNewRoom({ ...newRoom, count: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Rooms will be numbered {newRoom.floor ? `${newRoom.floor}01` : 'X01'} to {newRoom.floor ? `${newRoom.floor}${newRoom.count ? newRoom.count.toString().padStart(2, '0') : 'XX'}` : 'XXX'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-1">Capacity per Room</label>
                                <input
                                    type="number"
                                    placeholder="Capacity"
                                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newRoom.capacity}
                                    onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowRoomModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Generate Rooms</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


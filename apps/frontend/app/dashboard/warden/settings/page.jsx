"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Plus, Building2, DoorOpen, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WardenSettingsPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("blocks");
    const [loading, setLoading] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showBlockForm, setShowBlockForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [blockForm, setBlockForm] = useState({ name: "", description: "" });
    const [roomForm, setRoomForm] = useState({
        blockId: "",
        roomNumber: "",
        floor: "",
    });

    useEffect(() => {
        loadBlocks();
    }, []);

    const loadBlocks = async () => {
        try {
            setLoading(true);
            const res = await api.block.getAll();
            setBlocks(res.blocks || []);
        } catch (error) {
            console.error("Error loading blocks:", error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (activeTab === "rooms") loadRooms();
    }, [activeTab]);

    const handleCreateBlock = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.block.create(token, blockForm);
            toast.success("Block created successfully!");
            setBlockForm({ name: "", description: "" });
            setShowBlockForm(false);
            loadBlocks();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to create block");
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.room.createRoom(token, {
                ...roomForm,
                blockId: parseInt(roomForm.blockId),
                floor: parseInt(roomForm.floor),
            });
            toast.success("Room created successfully with capacity of 2!");
            setRoomForm({ blockId: "", roomNumber: "", floor: "" });
            setShowRoomForm(false);
            loadRooms();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to create room");
        }
    };

    const handleDeleteBlock = async (id) => {
        if (!confirm("Delete this block? All rooms in this block will be affected.")) return;
        try {
            const token = localStorage.getItem("token");
            await api.block.delete(token, id);
            toast.success("Block deleted");
            loadBlocks();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to delete block");
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!confirm("Delete this room?")) return;
        try {
            const token = localStorage.getItem("token");
            await api.room.deleteRoom(token, id);
            toast.success("Room deleted");
            loadRooms();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to delete room");
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-blue-100 rounded-lg transition">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Hostel Settings</h1>
                    <p className="text-gray-600">Manage blocks and rooms</p>
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
                    Blocks
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
            </div>

            {/* Blocks Tab */}
            {activeTab === "blocks" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Manage Blocks</h2>
                        <button
                            onClick={() => setShowBlockForm(!showBlockForm)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus size={20} /> Add Block
                        </button>
                    </div>

                    {/* Block Form */}
                    {showBlockForm && (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Block</h3>
                            <form onSubmit={handleCreateBlock} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Block Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={blockForm.name}
                                        onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                                        placeholder="e.g., Block A, Hostel 1"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={blockForm.description}
                                        onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                                        placeholder="Additional details about this block"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                                    >
                                        Create Block
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBlockForm(false)}
                                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Blocks List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : blocks.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-md text-center">
                            <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">No blocks created yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {blocks.map((block) => (
                                <div key={block.id} className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{block.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{block.description || "No description"}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBlock(block.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            Total Rooms: <span className="font-medium text-gray-800">{block._count?.rooms || 0}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rooms Tab */}
            {activeTab === "rooms" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Manage Rooms</h2>
                        <button
                            onClick={() => setShowRoomForm(!showRoomForm)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus size={20} /> Add Room
                        </button>
                    </div>

                    {/* Room Form */}
                    {showRoomForm && (
                        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Room</h3>
                            <p className="text-sm text-gray-600 mb-4">Room capacity is fixed at 2 students per room</p>
                            <form onSubmit={handleCreateRoom} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Block *</label>
                                        <select
                                            required
                                            value={roomForm.blockId}
                                            onChange={(e) => setRoomForm({ ...roomForm, blockId: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Block</option>
                                            {blocks.map((block) => (
                                                <option key={block.id} value={block.id}>
                                                    {block.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Room Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={roomForm.roomNumber}
                                            onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                                            placeholder="e.g., 101, A-201"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Floor *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={roomForm.floor}
                                            onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                                            placeholder="e.g., 1, 2, 3"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                                    >
                                        Create Room (Capacity: 2)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowRoomForm(false)}
                                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Rooms List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-md text-center">
                            <DoorOpen size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">No rooms created yet</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Block</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Room Number</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Floor</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Capacity</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Occupied</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                                                        room.status === "OCCUPIED" ? "bg-blue-100 text-blue-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {room.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        disabled={room.occupied > 0}
                                                        title={room.occupied > 0 ? "Cannot delete occupied room" : "Delete room"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

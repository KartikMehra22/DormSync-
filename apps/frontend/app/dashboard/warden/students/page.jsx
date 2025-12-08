"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Search, Plus, Edit2, Trash2, Mail, Phone, BedDouble, UserPlus } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentsPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <StudentsContent />
        </ProtectedRoute>
    );
}

function StudentsContent() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("asc");

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: "", email: "" });
    const [adding, setAdding] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadStudents();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page, sortBy, order]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await api.auth.getAllStudents(token, {
                page,
                limit,
                search: searchTerm,
                sortBy,
                order
            });

            const mappedStudents = res.students?.map(s => {
                const allocation = s.roomAllocation && s.roomAllocation.length > 0 ? s.roomAllocation[0] : null;
                const activeRoom = allocation ? allocation.room : null;

                return {
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    phone: s.profile?.phoneNumber || "N/A",
                    room: activeRoom ? `${activeRoom.block?.name || ''} - ${activeRoom.roomNumber || ''}` : "Not Assigned",
                    course: s.profile?.department || "N/A",
                    year: s.profile?.year ? `${s.profile.year} Year` : "N/A",
                    status: activeRoom ? "active" : "unallocated",
                    allocationId: allocation?.id
                };
            }) || [];

            setStudents(mappedStudents);
            if (res.pagination) {
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Failed to load student list");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = (student) => {
        setSelectedStudent(student);
        setAssignModal(true);
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            const token = localStorage.getItem("token");
            await api.auth.addStudent(token, newStudent);
            toast.success("Student added to whitelist! They can now register.");
            setShowModal(false);
            setNewStudent({ name: "", email: "" });
            loadStudents();
        } catch (error) {
            console.error("Error adding student:", error);
            toast.error(error.response?.data?.ERROR || "Failed to add student");
        } finally {
            setAdding(false);
        }
    };

    // ... imports for pagination icons if needed, using standard buttons for now ...

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="username">Username</option>
                        <option value="createdAt">Date Joined</option>
                    </select>
                    <button
                        onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                    >
                        {order === "asc" ? "↑" : "↓"}
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Contact</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Room</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Details</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-800">{student.name}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} />
                                                <span>{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} />
                                                <span>{student.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <BedDouble size={16} className="text-gray-400" />
                                            <span className="font-medium text-gray-800">{student.room}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm">
                                            <p className="text-gray-800">{student.course}</p>
                                            <p className="text-gray-500">{student.year}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {student.status === "active" ? "Allocated" : "Unallocated"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {student.status === "unallocated" ? (
                                                <button
                                                    onClick={() => handleAssignClick(student)}
                                                    className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                                                >
                                                    <UserPlus size={16} />
                                                    Assign Room
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toast.success("Edit allocation coming soon")}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => toast.error("Delete feature coming soon")}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && students.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No students found
                    </div>
                )}

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Page <b>{page}</b> of <b>{totalPages}</b></span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Add Student to Whitelist</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Enter the student's details. They will use this email to register their account.
                        </p>

                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {adding ? "Adding..." : "Add Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Room Modal - Placeholder for logic */}
            {assignModal && selectedStudent && (
                <AssignRoomModal
                    student={selectedStudent}
                    onClose={() => setAssignModal(false)}
                    onSuccess={() => {
                        setAssignModal(false);
                        loadStudents(); // Refresh list
                    }}
                />
            )}
        </div>
    );
}

// Sub-component for Assign Room Logic to keep main component clean
function AssignRoomModal({ student, onClose, onSuccess }) {
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingRooms, setFetchingRooms] = useState(false);

    useEffect(() => {
        loadBlocks();
    }, []);

    useEffect(() => {
        if (selectedBlock) {
            loadRooms(selectedBlock);
        } else {
            setRooms([]);
        }
    }, [selectedBlock]);

    const loadBlocks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.room.getAllBlocks(token);
            setBlocks(res.blocks || []);
        } catch (error) {
            toast.error("Failed to load blocks");
        }
    };

    const loadRooms = async (blockId) => {
        try {
            setFetchingRooms(true);
            const token = localStorage.getItem("token");
            // API to get rooms for block. Assuming getAllRooms supports blockId filter
            const res = await api.room.getAllRooms({ blockId, available: true });
            setRooms(res.rooms || []);
        } catch (error) {
            toast.error("Failed to load rooms");
        } finally {
            setFetchingRooms(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await api.room.allocateRoom(token, { userId: student.id, roomId: selectedRoom });
            toast.success(`Room assigned to ${student.name}`);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to assign room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Room</h3>
                <p className="text-gray-600 mb-4">Assigning room for <span className="font-semibold">{student.name}</span></p>

                <form onSubmit={handleAssign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Block</label>
                        <select
                            required
                            value={selectedBlock}
                            onChange={(e) => setSelectedBlock(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select Block --</option>
                            {blocks.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                        <select
                            required
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            disabled={!selectedBlock || fetchingRooms}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">-- Select Room --</option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.roomNumber} ({r.type || "Standard"}) - {r.capacity - r.occupied} Slots Left
                                </option>
                            ))}
                        </select>
                        {fetchingRooms && <p className="text-xs text-blue-500 mt-1">Loading rooms...</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading || !selectedRoom} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {loading ? "Assigning..." : "Confirm Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

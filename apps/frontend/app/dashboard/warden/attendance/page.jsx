"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Moon, Search, CheckCircle, UserCheck, AlertCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AttendancePage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <AttendanceContent />
        </ProtectedRoute>
    );
}

function AttendanceContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, PRESENT, PENDING

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const today = new Date().toISOString().split("T")[0];

            // Fetch allocations (all active students) and today's attendance (present students)
            const [allocationsRes, attendanceRes] = await Promise.all([
                api.room.getAllAllocations(token),
                api.attendance.getAllAttendance(token, { date: today })
            ]);

            const attendedUserIds = new Set(attendanceRes.attendance?.map(a => a.userId));
            const attendanceMap = new Map(attendanceRes.attendance?.map(a => [a.userId, a]));

            const mappedStudents = allocationsRes.allocations?.map(a => {
                const isPresent = attendedUserIds.has(a.userId);
                const attendanceRecord = attendanceMap.get(a.userId);

                return {
                    id: a.user.id,
                    name: a.user.name,
                    room: `${a.room.block?.name || ''} ${a.room.roomNumber}`,
                    status: isPresent ? "PRESENT" : "PENDING",
                    checkInTime: attendanceRecord?.checkInTime
                        ? new Date(attendanceRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null
                };
            }) || [];

            setStudents(mappedStudents);
        } catch (error) {
            console.error("Error loading attendance data:", error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPresent = async (studentId, studentName) => {
        try {
            const token = localStorage.getItem("token");
            const today = new Date().toISOString().split("T")[0];

            await api.attendance.markAttendance(token, {
                userId: studentId,
                date: today,
                status: "PRESENT",
                remarks: "Marked manually by warden" // You could add a prompt for remarks if needed
            });

            // Optimistic update
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, status: "PRESENT", checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                    : s
            ));

            toast.success(`Marked ${studentName} as present`);
        } catch (error) {
            console.error("Error marking attendance:", error);
            toast.error("Failed to mark attendance");
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.room.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "ALL" || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: students.length,
        present: students.filter(s => s.status === "PRESENT").length,
        pending: students.filter(s => s.status === "PENDING").length,
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
                <h2 className="text-2xl font-bold text-gray-800">Night Attendance</h2>
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <Clock size={18} />
                    <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="text-blue-600" size={20} />
                        <p className="text-sm text-blue-700">Total Students</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="text-sm text-green-700">Present Tonight</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-yellow-600" size={20} />
                        <p className="text-sm text-yellow-700">Pending</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    {["ALL", "PRESENT", "PENDING"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                    <Moon className="text-indigo-600" size={20} />
                    <h3 className="font-bold text-gray-800">Attendance List</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div key={student.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.status === "PRESENT" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                                            }`}>
                                            {student.status === "PRESENT" ? <CheckCircle size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{student.name}</p>
                                            <p className="text-sm text-gray-600">Room {student.room}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {student.status === "PRESENT" && (
                                            <span className="text-sm text-gray-500 mr-2">
                                                In at {student.checkInTime}
                                            </span>
                                        )}

                                        {student.status === "PENDING" ? (
                                            <button
                                                onClick={() => handleMarkPresent(student.id, student.name)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                                            >
                                                Mark Present
                                            </button>
                                        ) : (
                                            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium text-sm border border-green-200 flex items-center gap-2">
                                                <CheckCircle size={16} />
                                                Present
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No students found matching your filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

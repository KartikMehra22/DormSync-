"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function WardenAttendanceMarkingPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <AttendanceMarkingContent />
        </ProtectedRoute>
    );
}

function AttendanceMarkingContent() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            loadAttendance();
        }
    }, [selectedDate]);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await api.attendance.getAllAttendance(token, { date: selectedDate });
            setAttendanceData(res.attendance || []);
        } catch (error) {
            console.error("Error loading attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (userName, status) => {
        try {
            const token = localStorage.getItem("token");
            await api.attendance.markAttendance(token, {
                userName,
                date: selectedDate,
                status,
            });
            toast.success(`Marked ${userName} as ${status}`);
            loadAttendance();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to mark attendance");
        }
    };

    const filteredData = attendanceData.filter((record) =>
        record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter((a) => a.status === "PRESENT").length,
        absent: attendanceData.filter((a) => a.status === "ABSENT").length,
        late: attendanceData.filter((a) => a.status === "LATE").length,
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-indigo-100 rounded-lg transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mark Attendance</h1>
                    <p className="text-gray-600">Search and mark student attendance by name</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, username, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <UserCheck className="text-gray-400" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Present</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.present}</h3>
                        </div>
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Absent</p>
                            <h3 className="text-2xl font-bold text-red-600">{stats.absent}</h3>
                        </div>
                        <XCircle className="text-red-400" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Late</p>
                            <h3 className="text-2xl font-bold text-yellow-600">{stats.late}</h3>
                        </div>
                        <Clock className="text-yellow-400" size={32} />
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Student Name</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Username</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Room</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Check-in Time</th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-100 hover:bg-indigo-50">
                                        <td className="py-3 px-4 font-medium">{record.user.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.user.username}</td>
                                        <td className="py-3 px-4">
                                            {record.user.roomAllocation?.room?.roomNumber || "N/A"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === "PRESENT"
                                                        ? "bg-green-100 text-green-700"
                                                        : record.status === "ABSENT"
                                                            ? "bg-red-100 text-red-700"
                                                            : record.status === "LATE"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {record.checkInTime
                                                ? new Date(record.checkInTime).toLocaleTimeString()
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleMarkAttendance(record.user.name, "PRESENT")}
                                                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition"
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(record.user.name, "ABSENT")}
                                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition"
                                                >
                                                    Absent
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(record.user.name, "LATE")}
                                                    className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition"
                                                >
                                                    Late
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No students found. Try a different search term.
                        </div>
                    )}
                </div>
            )}

            {/* Quick Mark Section */}
            <div className="mt-6 bg-indigo-50 border border-indigo-200 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Mark (By Name)</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Enter student name below to quickly mark attendance without finding them in the table
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const name = formData.get("studentName");
                        const status = formData.get("status");
                        if (name && status) {
                            handleMarkAttendance(name, status);
                            e.target.reset();
                        }
                    }}
                    className="flex gap-4"
                >
                    <input
                        type="text"
                        name="studentName"
                        placeholder="Student name..."
                        required
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                        name="status"
                        required
                        className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="ON_LEAVE">On Leave</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                    >
                        Mark
                    </button>
                </form>
            </div>
        </div>
    );
}

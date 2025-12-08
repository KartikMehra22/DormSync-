"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Coffee, Sun, Moon, TrendingUp, Download } from "lucide-react";
import api from "@/lib/api";

export default function AttendancePage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <AttendanceContent />
        </ProtectedRoute>
    );
}

function AttendanceContent() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, [month]);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const startDate = new Date(month + "-01");
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            const res = await api.attendance.getMyAttendance(token, {
                startDate: startDate.toISOString().split("T")[0],
                endDate: endDate.toISOString().split("T")[0],
            });

            const records = res.attendance || [];
            setAttendance(records);

            // Calculate stats
            const totalDays = records.length;
            const present = records.filter(r => r.status === "PRESENT").length;
            const absent = records.filter(r => r.status === "ABSENT").length;
            const late = records.filter(r => r.status === "LATE").length;

            setStats({
                present,
                absent,
                late,
                total: totalDays
            });
        } catch (error) {
            console.error("Error loading attendance:", error);
        } finally {
            setLoading(false);
        }
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
                    <p className="text-gray-600">View your hostel entry and exit history</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Month Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-green-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Sun className="text-green-500" size={24} />
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Present</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Days Present</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
                </div>

                <div className="bg-white rounded-lg border border-red-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Moon className="text-red-500" size={24} />
                        <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">Absent</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Days Absent</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.absent}</p>
                </div>

                <div className="bg-white rounded-lg border border-yellow-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Coffee className="text-yellow-500" size={24} />
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Late</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Late Entries</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.late}</p>
                </div>
            </div>

            {/* Daily Records Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Daily Records</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Date</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Entry Time</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Exit Time</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No attendance records for this month
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record) => {
                                    const date = new Date(record.date);
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-800">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                                                <div className="text-xs text-gray-500">{date.toLocaleDateString("en-US", { weekday: "long" })}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === "PRESENT" ? "bg-green-100 text-green-700" :
                                                        record.status === "ABSENT" ? "bg-red-100 text-red-700" :
                                                            record.status === "LATE" ? "bg-yellow-100 text-yellow-700" :
                                                                "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-sm">
                                                {record.remarks || "-"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

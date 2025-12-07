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
        overall: 0,
        breakfast: { present: 0, total: 0 },
        lunch: { present: 0, total: 0 },
        dinner: { present: 0, total: 0 },
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

            // Calculate stats (mock data for meal-specific)
            const totalDays = records.length;
            const presentDays = records.filter(r => r.status === "PRESENT").length;

            setStats({
                overall: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
                breakfast: { present: 6, total: 7 },
                lunch: { present: 5, total: 7 },
                dinner: { present: 5, total: 7 },
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
                    <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
                    <p className="text-gray-600">View your meal attendance records</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.overall}%</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${stats.overall}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Coffee className="text-orange-500" size={24} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Breakfast</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.breakfast.present}/{stats.breakfast.total}</p>
                    <p className="text-sm text-gray-500">{Math.round((stats.breakfast.present / stats.breakfast.total) * 100)}% attendance</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Sun className="text-yellow-500" size={24} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Lunch</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.lunch.present}/{stats.lunch.total}</p>
                    <p className="text-sm text-gray-500">{Math.round((stats.lunch.present / stats.lunch.total) * 100)}% attendance</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Moon className="text-indigo-500" size={24} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Dinner</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.dinner.present}/{stats.dinner.total}</p>
                    <p className="text-sm text-gray-500">{Math.round((stats.dinner.present / stats.dinner.total) * 100)}% attendance</p>
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
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Day</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Breakfast</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Lunch</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Dinner</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No attendance records for this month
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record) => {
                                    const date = new Date(record.date);
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                            <td className="py-3 px-4">{date.toLocaleDateString("en-US", { weekday: "long" })}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    Present
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 ${record.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded-full text-sm font-medium`}>
                                                    {record.status === "PRESENT" ? "Present" : "Absent"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    Present
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium">3/3</td>
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

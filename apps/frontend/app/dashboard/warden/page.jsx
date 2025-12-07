"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Moon, TrendingUp, CheckCircle, Users, Utensils, AlertCircle, BedDouble } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function WardenDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        optedOutToday: 0,
        openIssues: 0,
        occupancy: {
            occupied: 0,
            total: 0
        },
        attendanceTrend: [],
        recentActivities: [],
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const today = new Date().toISOString().split("T")[0];

            // Parallel data fetching
            const [
                attendanceRes,
                optOutsRes,
                allocationsRes,
                issuesRes,
                roomsRes,
                reportRes
            ] = await Promise.all([
                api.attendance.getAllAttendance(token, { date: today }),
                api.mess.getAllOptOuts(token, { date: today }),
                api.room.getAllAllocations(token),
                api.issue.getAllIssues(token), // Fetch all to filter client-side
                api.room.getAllRooms(),
                api.attendance.getReports(token) // Get generic report for trend
            ]);

            // Process Attendance (Night Attendance)
            const presentCount = attendanceRes.attendance?.filter(a => a.status === "PRESENT").length || 0;

            // Process Occupancy
            const totalCapacity = roomsRes.rooms?.reduce((sum, room) => sum + room.capacity, 0) || 0;
            const totalOccupied = allocationsRes.allocations?.length || 0;

            // Process Trend (Last 7 days from report or mock if empty logic needs more complex processing)
            // Using report summary for now or mocking trend from report data if structured differently
            const trendData = reportRes.attendance?.slice(0, 7).map(a => ({
                day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
                total: a.status === 'PRESENT' ? 1 : 0
            })) || [];
            // Note: Real trend requires aggregation by date. 
            // Simple aggregation:
            const trendMap = {};
            reportRes.attendance?.forEach(a => {
                const day = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
                trendMap[day] = (trendMap[day] || 0) + (a.status === 'PRESENT' ? 1 : 0);
            });
            const formattedTrend = Object.keys(trendMap).map(day => ({ day, total: trendMap[day] })).slice(-7);


            // specific recent activities (Issues + OptOuts mix)
            const recentIssues = issuesRes.issues?.slice(0, 3).map(i => ({
                student: i.user?.name || "Student",
                action: `reported an issue: ${i.title}`,
                time: new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })) || [];

            const recentOptOuts = optOutsRes.optOuts?.slice(0, 2).map(o => ({
                student: o.user?.name || "Student",
                action: `opted out of ${o.shift}`,
                time: "Today"
            })) || [];

            setStats({
                totalStudents: totalOccupied,
                presentToday: presentCount,
                optedOutToday: optOutsRes.summary?.total || 0,
                openIssues: issuesRes.issues?.filter(i => ["PENDING", "IN_PROGRESS"].includes(i.status)).length || 0,
                occupancy: {
                    occupied: totalOccupied,
                    total: totalCapacity
                },
                attendanceTrend: formattedTrend.length > 0 ? formattedTrend : [
                    { day: "Mon", total: 0 }, { day: "Tue", total: 0 }, { day: "Wed", total: 0 },
                    { day: "Thu", total: 0 }, { day: "Fri", total: 0 }, { day: "Sat", total: 0 }, { day: "Sun", total: 0 }
                ],
                recentActivities: [...recentIssues, ...recentOptOuts],
            });

        } catch (error) {
            console.error("Error loading dashboard:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (val, total) => {
        return total > 0 ? Math.round((val / total) * 100) : 0;
    };

    const maxTrend = Math.max(...stats.attendanceTrend.map(d => d.total), 10); // Avoid divide by zero

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Night Attendance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Moon className="text-indigo-500" size={28} />
                            <span className="font-bold text-gray-800">Night Attendance</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.presentToday}</span>
                            <span className="text-gray-600 mb-1">/ {stats.totalStudents} checked in</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full transition-all"
                                style={{ width: `${calculatePercentage(stats.presentToday, stats.totalStudents)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        For today (after 9 PM)
                    </p>
                </div>

                {/* Room Occupancy */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BedDouble className="text-blue-500" size={28} />
                            <span className="font-bold text-gray-800">Room Occupancy</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.occupancy.occupied}</span>
                            <span className="text-gray-600 mb-1">/ {stats.occupancy.total} beds</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all"
                                style={{ width: `${calculatePercentage(stats.occupancy.occupied, stats.occupancy.total)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Total allocated students
                    </p>
                </div>

                {/* Open Issues */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-500" size={28} />
                            <span className="font-bold text-gray-800">Open Issues</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.openIssues}</span>
                            <span className="text-gray-600 mb-1">pending</span>
                        </div>
                        <div className="w-full bg-red-100 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Requires attention
                    </p>
                </div>
            </div>

            {/* Recent Activities and Weekly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Activities */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-blue-600" size={20} />
                        <h3 className="font-bold text-gray-800">Recent Activities</h3>
                    </div>
                    <div className="space-y-3">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle className="text-green-600 mt-0.5" size={18} />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-medium">{activity.student}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activities found.</p>
                        )}
                    </div>
                </div>

                {/* Weekly Attendance Trend */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Weekly Attendance Trend</h3>
                    <div className="space-y-3">
                        {stats.attendanceTrend.map((day, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                                    <span className="text-sm font-bold text-gray-800">{day.total}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all"
                                        style={{ width: `${(day.total / maxTrend) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-700">Total Students</p>
                        <Users className="text-blue-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                </div>

                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-700">Present Tonight</p>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-700">Meals Opted Out</p>
                        <Utensils className="text-yellow-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.optedOutToday}</p>
                </div>

                <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-700">Open Tickets</p>
                        <AlertCircle className="text-purple-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.openIssues}</p>
                </div>
            </div>
        </div>
    );
}

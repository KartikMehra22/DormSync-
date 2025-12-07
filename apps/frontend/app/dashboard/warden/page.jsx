"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Coffee, Sun, Moon, TrendingUp, CheckCircle, Users, Utensils, Wallet, } from "lucide-react";
import api from "@/lib/api";

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
        totalStudents: 245,
        activeToday: 185,
        optedOutToday: 42,
        creditsRedeemed: 18,
        mealAttendance: {
            breakfast: { attended: 185, total: 245 },
            lunch: { attended: 98, total: 245 },
            dinner: { attended: 0, total: 245 },
        },
        weeklyTrend: [
            { day: "Mon", total: 630 },
            { day: "Tue", total: 635 },
            { day: "Wed", total: 624 },
            { day: "Thu", total: 602 },
            { day: "Fri", total: 635 },
            { day: "Sat", total: 583 },
            { day: "Sun", total: 283 },
        ],
        recentActivities: [
            { student: "John Doe", action: "marked present for breakfast", time: "5 minutes ago" },
            { student: "Sarah Wilson", action: "marked present for breakfast", time: "8 minutes ago" },
            { student: "Michael Brown", action: "marked present for breakfast", time: "12 minutes ago" },
            { student: "Emily Davis", action: "opted out of lunch", time: "1 hour ago" },
            { student: "David Martinez", action: "marked present for breakfast", time: "1 hour ago" },
        ],
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            // Load real data from APIs
            const token = localStorage.getItem("token");
            // For now using mock data, but you can fetch real data here
            setLoading(false);
        } catch (error) {
            console.error("Error loading dashboard:", error);
            setLoading(false);
        }
    };

    const getMealIcon = (meal) => {
        if (meal === "breakfast") return <Coffee className="text-orange-500" size={28} />;
        if (meal === "lunch") return <Sun className="text-yellow-500" size={28} />;
        return <Moon className="text-indigo-500" size={28} />;
    };

    const calculatePercentage = (attended, total) => {
        return total > 0 ? Math.round((attended / total) * 100) : 0;
    };

    const maxTrend = Math.max(...stats.weeklyTrend.map(d => d.total));

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

            {/* Meal Attendance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Breakfast */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {getMealIcon("breakfast")}
                            <span className="font-bold text-gray-800">Breakfast Attendance</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.mealAttendance.breakfast.attended}</span>
                            <span className="text-gray-600 mb-1">/ {stats.mealAttendance.breakfast.total}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-orange-500 h-full transition-all"
                                style={{ width: `${calculatePercentage(stats.mealAttendance.breakfast.attended, stats.mealAttendance.breakfast.total)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {calculatePercentage(stats.mealAttendance.breakfast.attended, stats.mealAttendance.breakfast.total)}% attended
                    </p>
                </div>

                {/* Lunch */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {getMealIcon("lunch")}
                            <span className="font-bold text-gray-800">Lunch Attendance</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.mealAttendance.lunch.attended}</span>
                            <span className="text-gray-600 mb-1">/ {stats.mealAttendance.lunch.total}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-yellow-500 h-full transition-all"
                                style={{ width: `${calculatePercentage(stats.mealAttendance.lunch.attended, stats.mealAttendance.lunch.total)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {calculatePercentage(stats.mealAttendance.lunch.attended, stats.mealAttendance.lunch.total)}% attended
                    </p>
                </div>

                {/* Dinner */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {getMealIcon("dinner")}
                            <span className="font-bold text-gray-800">Dinner Attendance</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-800">{stats.mealAttendance.dinner.attended}</span>
                            <span className="text-gray-600 mb-1">/ {stats.mealAttendance.dinner.total}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full transition-all"
                                style={{ width: `${calculatePercentage(stats.mealAttendance.dinner.attended, stats.mealAttendance.dinner.total)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        {stats.mealAttendance.dinner.attended > 0 ? calculatePercentage(stats.mealAttendance.dinner.attended, stats.mealAttendance.dinner.total) : "Not started"} yet
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
                        {stats.recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="text-green-600 mt-0.5" size={18} />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-medium">{activity.student}</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Attendance Trend */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Weekly Attendance Trend</h3>
                    <div className="space-y-3">
                        {stats.weeklyTrend.map((day) => (
                            <div key={day.day}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                                    <span className="text-sm font-bold text-gray-800">{day.total} total</span>
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
                        <p className="text-sm text-green-700">Active Today</p>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.activeToday}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-700">Opted Out Today</p>
                        <Utensils className="text-yellow-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.optedOutToday}</p>
                </div>

                <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-700">Credits Redeemed</p>
                        <Wallet className="text-purple-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{stats.creditsRedeemed}</p>
                </div>
            </div>
        </div>
    );
}

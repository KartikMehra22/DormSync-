"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { Coffee, Sun, Moon, CheckCircle, Clock, Wallet } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentHomePage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <HomeContent />
        </ProtectedRoute>
    );
}

function HomeContent() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        credits: 0,
        roomNumber: null,
        todayMeals: {
            breakfast: null,
            lunch: null,
            dinner: null,
        },
        upcomingMeals: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Get credits
            const creditsRes = await api.mess.getCredits(token);

            // Get room info
            const roomRes = await api.room.getMyRoom(token);

            // Get today's opt-outs
            const today = new Date().toISOString().split("T")[0];
            const optOutsRes = await api.mess.getMyOptOuts(token, { date: today });

            // Get upcoming menu
            const menuRes = await api.mess.getMenu({ limit: 2 });

            setStats({
                credits: creditsRes.credits || 0,
                roomNumber: roomRes.allocation?.room?.roomNumber || "Not Assigned",
                todayMeals: {
                    breakfast: optOutsRes.optOuts?.find(o => o.shift === "BREAKFAST") ? "Opted Out" : "Opted In",
                    lunch: optOutsRes.optOuts?.find(o => o.shift === "LUNCH") ? "Opted Out" : "Opted In",
                    dinner: optOutsRes.optOuts?.find(o => o.shift === "DINNER") ? "Opted Out" : "Opted In",
                },
                upcomingMeals: menuRes.menu?.slice(0, 2) || [],
            });
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getMealIcon = (meal) => {
        if (meal === "breakfast") return <Coffee className="text-orange-500" size={24} />;
        if (meal === "lunch") return <Sun className="text-yellow-500" size={24} />;
        return <Moon className="text-indigo-500" size={24} />;
    };

    const getMealStatus = (status) => {
        if (status === "Opted Out") {
            return { text: "Opted Out", color: "text-red-600", bg: "bg-red-50", icon: Clock };
        }
        return { text: "Opted In", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle };
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
            {/* Welcome Section */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-600">Room {stats.roomNumber}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                        <Wallet size={18} />
                        <span>Available Credits</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.credits} meals</p>
                </div>
            </div>

            {/* Today's Meals */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Meals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["breakfast", "lunch", "dinner"].map((meal) => {
                        const status = getMealStatus(stats.todayMeals[meal]);
                        const StatusIcon = status.icon;
                        return (
                            <div key={meal} className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {getMealIcon(meal)}
                                        <span className="font-medium text-gray-800 capitalize">{meal}</span>
                                    </div>
                                    <StatusIcon className={status.color} size={20} />
                                </div>
                                <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Meals */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Meals</h3>
                <div className="space-y-4">
                    {stats.upcomingMeals.map((menu, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sun className="text-yellow-500" size={20} />
                                <h4 className="font-bold text-gray-800">{menu.shift}</h4>
                                <span className="text-sm text-gray-600">
                                    {new Date(menu.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Menu:</p>
                                <div className="flex flex-wrap gap-2">
                                    {menu.items?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

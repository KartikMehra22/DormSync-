"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Coffee, Sun, Moon, Info, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function MealPreferencesPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <MealPreferencesContent />
        </ProtectedRoute>
    );
}

function MealPreferencesContent() {
    const [credits, setCredits] = useState(0);
    const [optOuts, setOptOuts] = useState([]);
    const [upcomingDays, setUpcomingDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Get credits
            const creditsRes = await api.mess.getCredits(token);
            setCredits(creditsRes.credits || 0);

            // Get opt-outs for next 7 days
            const optOutsRes = await api.mess.getMyOptOuts(token);
            setOptOuts(optOutsRes.optOuts || []);

            // Generate upcoming 7 days
            const days = [];
            for (let i = 1; i <= 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                days.push(date);
            }
            setUpcomingDays(days);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptOut = async (date, shift) => {
        try {
            const token = localStorage.getItem("token");
            await api.mess.optOut(token, { date, shift });
            toast.success(`Opted out of ${shift.toLowerCase()}`);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to opt out");
        }
    };

    const handleCancelOptOut = async (optOutId) => {
        try {
            const token = localStorage.getItem("token");
            await api.mess.cancelOptOut(token, optOutId);
            toast.success("Cancelled opt-out");
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to cancel");
        }
    };

    const isOptedOut = (date, shift) => {
        const dateStr = date.toISOString().split("T")[0];
        return optOuts.find(o => o.date?.split("T")[0] === dateStr && o.shift === shift);
    };

    const getMealIcon = (shift) => {
        if (shift === "BREAKFAST") return <Coffee className="text-orange-500" size={20} />;
        if (shift === "LUNCH") return <Sun className="text-yellow-500" size={20} />;
        return <Moon className="text-indigo-500" size={20} />;
    };

    const potentialCredits = upcomingDays.reduce((total, date) => {
        return total + (isOptedOut(date, "BREAKFAST") ? 1 : 0) +
            (isOptedOut(date, "LUNCH") ? 1 : 0) +
            (isOptedOut(date, "DINNER") ? 1 : 0);
    }, 0);

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
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Meal Preferences</h2>
                    <p className="text-gray-600">Choose which meals you want to attend</p>
                </div>
                {potentialCredits > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3">
                        <p className="text-sm text-green-700">Credits to be Earned</p>
                        <p className="text-xl font-bold text-green-600">+{potentialCredits} meals</p>
                        <p className="text-xs text-green-600">₹{potentialCredits * 50} value</p>
                    </div>
                )}
            </div>

            {/* How it Works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Info className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Opt out of meals you don't want to attend</li>
                            <li>Each skipped meal earns you 1 credit (worth ₹50)</li>
                            <li>Redeem credits when needed or get a refund at month end</li>
                            <li>Changes must be made at least 4 hours before the meal</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Current Credits */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Current Credits Balance</p>
                        <p className="text-gray-500 text-xs">Available for redemption</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{credits} credits</p>
                        <p className="text-sm text-gray-600">₹{credits * 50} value</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Meals */}
            <div className="space-y-6">
                {upcomingDays.map((date, index) => {
                    const dayName = index === 0 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "long" });
                    const fullDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                    return (
                        <div key={index}>
                            <h3 className="font-bold text-gray-800 mb-3">{dayName}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {["BREAKFAST", "LUNCH", "DINNER"].map((shift) => {
                                    const optOut = isOptedOut(date, shift);
                                    const isOptedOutFlag = !!optOut;

                                    return (
                                        <div
                                            key={shift}
                                            className={`bg-white rounded-lg p-4 border-2 transition ${isOptedOutFlag
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-green-300 bg-green-50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getMealIcon(shift)}
                                                    <span className="font-medium text-gray-800">{shift.charAt(0) + shift.slice(1).toLowerCase()}</span>
                                                </div>
                                                {isOptedOutFlag ? (
                                                    <XCircle className="text-red-600" size={20} />
                                                ) : (
                                                    <CheckCircle className="text-green-600" size={20} />
                                                )}
                                            </div>

                                            <p className={`text-sm font-medium mb-2 ${isOptedOutFlag ? "text-red-600" : "text-green-600"}`}>
                                                {isOptedOutFlag ? "Opted Out (+1 credit)" : "Opted In"}
                                            </p>

                                            <p className="text-xs text-gray-600 mb-3">
                                                {shift === "BREAKFAST" && "7:00 AM - 9:00 AM"}
                                                {shift === "LUNCH" && "12:00 PM - 2:00 PM"}
                                                {shift === "DINNER" && "7:00 PM - 9:00 PM"}
                                            </p>

                                            {isOptedOutFlag ? (
                                                <button
                                                    onClick={() => handleCancelOptOut(optOut.id)}
                                                    className="w-full bg-white border border-green-600 text-green-600 py-1.5 rounded-lg text-sm font-medium hover:bg-green-50 transition"
                                                >
                                                    Cancel Opt-out
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleOptOut(date.toISOString().split("T")[0], shift)}
                                                    className="w-full bg-white border border-red-600 text-red-600 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                                                >
                                                    Opt Out
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

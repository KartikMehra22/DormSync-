"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Calendar, ChefHat, Users, Filter, Download, Check, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function WardenMessMenuPage() {
    const [activeTab, setActiveTab] = useState("optouts"); // Default to opt-outs as requested
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(false);

    // Opt-Out State
    const [optOuts, setOptOuts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedShift, setSelectedShift] = useState("LUNCH");
    const [loadingOptOuts, setLoadingOptOuts] = useState(false);

    // Redemption State
    const [redemptions, setRedemptions] = useState([]);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);

    useEffect(() => {
        if (activeTab === "menu") {
            loadMenu();
        } else if (activeTab === "optouts") {
            loadOptOuts();
        } else if (activeTab === "redemptions") {
            loadRedemptions();
        }
    }, [activeTab, selectedDate, selectedShift]);

    const loadMenu = async () => {
        try {
            setLoading(true);
            const res = await api.mess.getMenu();
            setMenu(res.menu || []);
        } catch (error) {
            console.error("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadOptOuts = async () => {
        try {
            setLoadingOptOuts(true);
            const token = localStorage.getItem("token");
            const res = await api.mess.getAllOptOuts(token, { date: selectedDate, shift: selectedShift });
            setOptOuts(res.optOuts || []);
        } catch (error) {
            console.error("Error loading opt-outs:", error);
            toast.error("Failed to load opt-outs");
        } finally {
            setLoadingOptOuts(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ChefHat className="text-blue-600" size={32} />
                        Mess Management
                    </h1>
                    <p className="text-gray-600">Manage menu and view student opt-outs</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("menu")}
                        className={`pb-4 px-2 font-medium transition ${activeTab === "menu" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Files & Menu
                    </button>
                    <button
                        onClick={() => setActiveTab("optouts")}
                        className={`pb-4 px-2 font-medium transition ${activeTab === "optouts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Daily Opt-Outs
                    </button>
                </div>

                {activeTab === "menu" ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                        <ChefHat size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">Menu Management</h3>
                        <p>Menu planning functionality coming soon.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Meal</label>
                                <select
                                    value={selectedShift}
                                    onChange={(e) => setSelectedShift(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                                >
                                    <option value="BREAKFAST">Breakfast</option>
                                    <option value="LUNCH">Lunch</option>
                                    <option value="DINNER">Dinner</option>
                                </select>
                            </div>
                            <div className="flex-1"></div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Opt-Outs</p>
                                <p className="text-2xl font-bold text-red-600">{optOuts.length}</p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Opted Out Students</h3>
                                <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1">
                                    <Download size={16} /> Export List
                                </button>
                            </div>

                            {loadingOptOuts ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : optOuts.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p>No students have opted out for this meal.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Student Name</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Username</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Email</th>
                                            <th className="text-left py-3 px-4 text-gray-700 font-medium">Opted Out At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {optOuts.map((opt) => (
                                            <tr key={opt.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{opt.user.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{opt.user.username}</td>
                                                <td className="py-3 px-4 text-gray-600">{opt.user.email}</td>
                                                <td className="py-3 px-4 text-gray-500 text-sm">
                                                    {new Date(opt.optedOutAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

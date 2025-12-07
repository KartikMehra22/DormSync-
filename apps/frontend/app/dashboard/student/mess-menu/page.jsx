"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Coffee, Sun, Moon, Calendar } from "lucide-react";
import api from "@/lib/api";

export default function MessMenuPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <MessMenuContent />
        </ProtectedRoute>
    );
}

function MessMenuContent() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            setLoading(true);
            const res = await api.mess.getMenu({ limit: 7 });
            setMenu(res.menu || []);
        } catch (error) {
            console.error("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const getMealIcon = (shift) => {
        if (shift === "BREAKFAST") return <Coffee className="text-orange-500" size={20} />;
        if (shift === "LUNCH") return <Sun className="text-yellow-500" size={20} />;
        return <Moon className="text-indigo-500" size={20} />;
    };

    const getMealTime = (shift) => {
        if (shift === "BREAKFAST") return "7:00 AM - 9:00 AM";
        if (shift === "LUNCH") return "12:00 PM - 2:00 PM";
        return "7:00 PM - 9:00 PM";
    };

    // Group menu by date
    const menuByDate = menu.reduce((acc, item) => {
        const date = new Date(item.date).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Weekly Mess Menu</h2>
            <p className="text-gray-600 mb-6">Check the menu for the upcoming week</p>

            <div className="space-y-6">
                {Object.entries(menuByDate).map(([date, meals]) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
                    const fullDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

                    return (
                        <div key={date} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-blue-600" size={20} />
                                <h3 className="font-bold text-gray-800">{dayName}</h3>
                                <span className="text-sm text-gray-600">{fullDate}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {meals.map((meal) => (
                                    <div key={meal.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {getMealIcon(meal.shift)}
                                            <span className="font-medium text-gray-800">{meal.shift.charAt(0) + meal.shift.slice(1).toLowerCase()}</span>
                                            <span className="text-sm text-gray-600">{getMealTime(meal.shift)}</span>
                                        </div>

                                        <ul className="space-y-1 ml-7">
                                            {meal.items?.map((item, i) => (
                                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${meal.shift === "BREAKFAST" ? "bg-orange-500" :
                                                            meal.shift === "LUNCH" ? "bg-yellow-500" : "bg-indigo-500"
                                                        }`}></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {Object.keys(menuByDate).length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No menu available for the upcoming week</p>
                    </div>
                )}
            </div>
        </div>
    );
}

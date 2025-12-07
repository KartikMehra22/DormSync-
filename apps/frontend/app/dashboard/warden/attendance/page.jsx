"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Coffee, Sun, Moon, Search, CheckCircle, UserCheck, XCircle } from "lucide-react";
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
    const [selectedMeal, setSelectedMeal] = useState("BREAKFAST");
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            // Mock data
            setStudents([
                { id: 1, name: "John Doe", room: "101", optedIn: true, credits: 5, present: false },
                { id: 2, name: "Sarah Wilson", room: "105", optedIn: true, credits: 3, present: false },
                { id: 3, name: "Michael Brown", room: "210", optedIn: true, credits: 8, present: false },
                { id: 4, name: "Emily Davis", room: "305", optedIn: false, credits: 2, present: false },
                { id: 5, name: "David Martinez", room: "402", optedIn: false, credits: 1, present: false },
                { id: 6, name: "Lisa Chen", room: "103", optedIn: true, credits: 4, present: false },
                { id: 7, name: "James Taylor", room: "207", optedIn: true, credits: 6, present: false },
                { id: 8, name: "Anna White", room: "309", optedIn: false, credits: 0, present: false },
            ]);
            setLoading(false);
        } catch (error) {
            console.error("Error loading students:", error);
            setLoading(false);
        }
    };

    const handleMarkPresent = (studentId) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, present: true } : s
        ));
        toast.success("Marked as present");
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.room.includes(searchTerm)
    );

    const stats = {
        optedIn: students.filter(s => s.optedIn).length,
        markedPresent: students.filter(s => s.present).length,
        optedOut: students.filter(s => !s.optedIn).length,
        total: students.length,
    };

    const getMealIcon = (meal) => {
        if (meal === "BREAKFAST") return <Coffee size={20} />;
        if (meal === "LUNCH") return <Sun size={20} />;
        return <Moon size={20} />;
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
                <h2 className="text-2xl font-bold text-gray-800">Mark Attendance</h2>
                <div className="flex items-center gap-2 text-gray-600">
                    <UserCheck size={20} />
                    <span className="font-medium">{stats.markedPresent} / {stats.total} marked</span>
                </div>
            </div>

            {/* Meal Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Select Meal</p>
                <div className="grid grid-cols-3 gap-4">
                    {["BREAKFAST", "LUNCH", "DINNER"].map((meal) => (
                        <button
                            key={meal}
                            onClick={() => setSelectedMeal(meal)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-medium transition ${selectedMeal === meal
                                    ? meal === "BREAKFAST" ? "border-orange-500 bg-orange-50 text-orange-700" :
                                        meal === "LUNCH" ? "border-yellow-500 bg-yellow-50 text-yellow-700" :
                                            "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                }`}
                        >
                            {getMealIcon(meal)}
                            <span>{meal.charAt(0) + meal.slice(1).toLowerCase()}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="text-blue-600" size={20} />
                        <p className="text-sm text-blue-700">Opted In</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.optedIn} students</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="text-sm text-green-700">Marked Present</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.markedPresent} students</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="text-red-600" size={20} />
                        <p className="text-sm text-red-700">Opted Out</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.optedOut} students</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                    {getMealIcon(selectedMeal)}
                    <h3 className="font-bold text-gray-800">{selectedMeal.charAt(0) + selectedMeal.slice(1).toLowerCase()} Attendance</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 mb-1">{student.name}</p>
                                    <p className="text-sm text-gray-600">Room {student.room}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.optedIn
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}>
                                            {student.optedIn ? "Opted In" : "Opted Out"}
                                        </span>
                                        <span className="text-xs text-gray-600">Credits: {student.credits}</span>
                                    </div>
                                </div>

                                {student.optedIn && (
                                    <button
                                        onClick={() => handleMarkPresent(student.id)}
                                        disabled={student.present}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${student.present
                                                ? "bg-green-600 text-white cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                            }`}
                                    >
                                        <CheckCircle size={18} />
                                        {student.present ? "Present" : "Present"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

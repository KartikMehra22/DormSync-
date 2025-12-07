"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Search, Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentsPage() {
    return (
        <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
            <StudentsContent />
        </ProtectedRoute>
    );
}

function StudentsContent() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // Mock data for now - replace with real API
            setStudents([
                {
                    id: 1,
                    name: "John Doe",
                    email: "john.doe@email.com",
                    phone: "+1 234-567-8900",
                    room: "101",
                    course: "Computer Science",
                    year: "3rd Year",
                    status: "active",
                },
                {
                    id: 2,
                    name: "Sarah Wilson",
                    email: "sarah.wilson@email.com",
                    phone: "+1 234-567-8901",
                    room: "105",
                    course: "Mechanical Engineering",
                    year: "2nd Year",
                    status: "active",
                },
                {
                    id: 3,
                    name: "Michael Brown",
                    email: "michael.brown@email.com",
                    phone: "+1 234-567-8902",
                    room: "210",
                    course: "Electrical Engineering",
                    year: "4th Year",
                    status: "active",
                },
                {
                    id: 4,
                    name: "Emily Davis",
                    email: "emily.davis@email.com",
                    phone: "+1 234-567-8903",
                    room: "305",
                    course: "Civil Engineering",
                    year: "1st Year",
                    status: "active",
                },
                {
                    id: 5,
                    name: "David Martinez",
                    email: "david.martinez@email.com",
                    phone: "+1 234-567-8904",
                    room: "402",
                    course: "Computer Science",
                    year: "3rd Year",
                    status: "inactive",
                },
            ]);
            setLoading(false);
        } catch (error) {
            console.error("Error loading students:", error);
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.room.includes(searchTerm)
    );

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
                <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Name</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Contact</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Room</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Course</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Year</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-800">{student.name}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} />
                                                <span>{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} />
                                                <span>{student.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-gray-800">{student.room}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{student.course}</td>
                                    <td className="py-3 px-4 text-gray-700">{student.year}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toast.info("Edit feature coming soon")}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => toast.error("Delete feature coming soon")}
                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No students found
                    </div>
                )}
            </div>
        </div>
    );
}

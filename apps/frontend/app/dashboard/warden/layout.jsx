"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Home, Calendar, Users, Building2, MessageSquare, ChefHat, DollarSign, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function WardenLayout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", icon: Home, path: "/dashboard/warden" },
        { name: "Attendance", icon: Calendar, path: "/dashboard/warden/attendance" },
        { name: "Students", icon: Users, path: "/dashboard/warden/students" },
        { name: "Rooms", icon: Building2, path: "/dashboard/warden/rooms" },
        { name: "Complaints", icon: MessageSquare, path: "/dashboard/warden/issues" },
        { name: "Mess Menu", icon: ChefHat, path: "/dashboard/warden/mess" },
    ];

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600">Hostel & Mess Management</h1>
                            <p className="text-sm text-gray-600">Warden Portal - {user?.username}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Horizontal Navigation */}
                    <nav className="flex gap-1 mt-4 overflow-x-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center gap-2 px-4 py-2.5 whitespace-nowrap rounded-t-lg transition ${isActive
                                        ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}

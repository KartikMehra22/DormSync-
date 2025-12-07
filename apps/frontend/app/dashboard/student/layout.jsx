"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Home, UtensilsCrossed, Wallet, Calendar, ChefHat, MessageSquare, Receipt, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function StudentLayout({ children }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { name: "Home", icon: Home, path: "/dashboard/student" },
        { name: "Meal Preferences", icon: UtensilsCrossed, path: "/dashboard/student/meal-preferences" },
        { name: "Credits", icon: Wallet, path: "/dashboard/student/credits" },
        { name: "Attendance", icon: Calendar, path: "/dashboard/student/attendance" },
        { name: "Mess Menu", icon: ChefHat, path: "/dashboard/student/mess-menu" },
        { name: "Complaints", icon: MessageSquare, path: "/dashboard/student/issues" },
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
                            <p className="text-sm text-gray-600">Student Portal - {user?.username}</p>
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
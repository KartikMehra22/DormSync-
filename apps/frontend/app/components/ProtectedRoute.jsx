"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isLoggedIn, user, loading } = useAuth();
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        // Check role access
        if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            if (user.role === "STUDENT") {
                router.push("/dashboard/student");
            } else if (user.role === "WARDEN" || user.role === "ADMIN") {
                router.push("/dashboard/warden");
            } else {
                router.push("/");
            }
            return;
        }

        // All checks passed, render the component
        setShouldRender(true);
    }, [isLoggedIn, user?.role, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn || !shouldRender) {
        return null;
    }

    return <>{children}</>;
}


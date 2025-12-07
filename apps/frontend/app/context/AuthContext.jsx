/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseJWT, isTokenExpired } from "@/lib/jwt";
import api from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (storedToken && !isTokenExpired(storedToken)) {
                setToken(storedToken);
                const userData = parseJWT(storedToken);
                setUser(userData);
            } else if (storedToken) {
                // Token expired, clear it
                localStorage.removeItem("token");
            }
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            const data = await api.auth.login(credentials);
            if (data.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                const userData = parseJWT(data.token);
                setUser(userData);

                // Redirect based on role
                if (userData.role === "STUDENT") {
                    router.push("/dashboard/student");
                } else if (userData.role === "WARDEN" || userData.role === "ADMIN") {
                    router.push("/dashboard/warden");
                }
                return data;
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.push("/login"); // Redirect to login on logout
    };

    const updateUserData = (newToken) => {
        const userData = parseJWT(newToken);
        setUser(userData);
    };

    const isLoggedIn = !!token && !!user;

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isLoggedIn,
                login,
                logout,
                updateUserData,
                loading
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

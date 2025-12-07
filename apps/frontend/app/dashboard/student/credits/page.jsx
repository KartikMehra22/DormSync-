"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Wallet, TrendingUp, TrendingDown, Info, ArrowUpCircle, DollarSign } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CreditsPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <CreditsContent />
        </ProtectedRoute>
    );
}

function CreditsContent() {
    const [credits, setCredits] = useState(0);
    const [optOuts, setOptOuts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const creditsRes = await api.mess.getCredits(token);
            setCredits(creditsRes.credits || 0);

            const optOutsRes = await api.mess.getMyOptOuts(token);
            setOptOuts(optOutsRes.optOuts || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalEarned = optOuts.length;
    const totalRedeemed = totalEarned - credits;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Credit Management</h2>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Available Credits */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <Wallet size={32} />
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-blue-100 text-sm mb-1">Available Credits</p>
                    <p className="text-3xl font-bold">{credits} credits</p>
                    <p className="text-blue-100 text-sm mt-1">₹{credits * 50} value</p>
                </div>

                {/* Total Earned */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowUpCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-gray-800">{totalEarned} credits</p>
                    <p className="text-sm text-gray-500">₹{totalEarned * 50}</p>
                </div>

                {/* Total Redeemed */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingDown className="text-orange-600" size={24} />
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Total Redeemed</p>
                    <p className="text-2xl font-bold text-gray-800">{totalRedeemed} credits</p>
                    <p className="text-sm text-gray-500">₹{totalRedeemed * 50}</p>
                </div>
            </div>

            {/* Redeem Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Redeem Your Credits</h3>
                        <p className="text-gray-600 text-sm">Convert your credits to cash refund</p>
                    </div>
                    <button
                        onClick={() => toast.info("Redemption feature coming soon!")}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
                    >
                        <DollarSign size={20} />
                        Redeem Credits
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Info className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Redemption Information:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Each credit is worth ₹50</li>
                            <li>Refund will be processed within 3-5 working days</li>
                            <li>Minimum redemption: 1 credit</li>
                            <li>Credits can also be accumulated for end-of-month refund</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Transaction History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {optOuts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No transactions yet
                        </div>
                    ) : (
                        optOuts.slice(0, 10).map((optOut) => (
                            <div key={optOut.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="  flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <ArrowUpCircle className="text-green-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Skipped {optOut.shift?.toLowerCase()}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(optOut.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">+1 credit</p>
                                        <p className="text-sm text-gray-600">₹50</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

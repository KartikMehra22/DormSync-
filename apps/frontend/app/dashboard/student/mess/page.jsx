"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, UtensilsCrossed, Coins, Calendar, X, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function MessPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <MessContent />
        </ProtectedRoute>
    );
}

function MessContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("opt-out");
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(0);
    const [optOuts, setOptOuts] = useState([]);
    const [redeemAmount, setRedeemAmount] = useState("");
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redemptionRequests, setRedemptionRequests] = useState([]);

    useEffect(() => {
        loadData();
    }, [activeTab]); // Reload when tab changes

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const [creditsRes, optOutsRes, redemptionsRes] = await Promise.all([
                api.mess.getCredits(token),
                api.mess.getMyOptOuts(token),
                api.mess.getMyRedemptions(token)
            ]);
            setCredits(creditsRes.totalCredits || 0);
            setOptOuts(optOutsRes.optOuts || []);
            setRedemptionRequests(redemptionsRes.requests || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        try {
            if (parseFloat(redeemAmount) > credits) {
                toast.error("Insufficient credits");
                return;
            }
            const token = localStorage.getItem("token");
            await api.mess.requestRedemption(token, { amount: parseFloat(redeemAmount) });
            toast.success("Redemption requested!");
            setRedeemAmount("");
            setShowRedeemModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to request redemption");
        }
    };

    // ... existing handleOptOut ...
    const handleOptOut = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.mess.optOut(token, optOutForm);
            toast.success(`Opted out! ₹${optOutForm.creditEarned} credits added`);
            setOptOutForm({ date: "", shift: "BREAKFAST", creditEarned: 50 });
            loadData();
        } catch (error) {
            const msg = error.response?.data?.ERROR || "Failed to opt out";
            toast.error(msg);
        }
    };

    const handleCancelOptOut = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await api.mess.cancelOptOut(token, id);
            toast.success("Opt-out cancelled");
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to cancel");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-pink-100 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Mess Management</h1>
                        <p className="text-gray-600">Opt-out of meals and manage credits</p>
                    </div>
                </div>

                {/* Credits Card */}
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 rounded-xl shadow-lg text-white mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-pink-100 mb-1">Your Mess Credits</p>
                            <h2 className="text-4xl font-bold">₹{credits}</h2>
                            <p className="text-sm text-pink-100 mt-2">Redeemable for refund or college outlets</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <Coins size={60} className="opacity-80" />
                            <button
                                onClick={() => setShowRedeemModal(true)}
                                className="bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 transition shadow-sm"
                            >
                                Redeem Credits
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("opt-out")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "opt-out"
                            ? "bg-pink-600 text-white"
                            : "bg-white text-gray-700 hover:bg-pink-50"
                            }`}
                    >
                        Opt-Out of Meals
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === "history"
                            ? "bg-pink-600 text-white"
                            : "bg-white text-gray-700 hover:bg-pink-50"
                            }`}
                    >
                        History & Redemptions
                    </button>
                </div>

                {/* Opt-Out Form */}
                {activeTab === "opt-out" && (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <UtensilsCrossed size={24} className="text-pink-600" />
                            Skip a Meal
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Earn ₹50 credits for each meal you opt-out of (cannot opt-out of past meals)
                        </p>

                        <form onSubmit={handleOptOut} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={optOutForm.date}
                                    onChange={(e) =>
                                        setOptOutForm({ ...optOutForm, date: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Meal Shift</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {shifts.map((shift) => (
                                        <button
                                            key={shift}
                                            type="button"
                                            onClick={() => setOptOutForm({ ...optOutForm, shift })}
                                            className={`py-3 rounded-lg font-medium transition ${optOutForm.shift === shift
                                                ? "bg-pink-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-pink-50"
                                                }`}
                                        >
                                            {shift}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition"
                            >
                                Opt-Out & Earn ₹50 Credits
                            </button>
                        </form>
                    </div>
                )}

                {/* History */}
                {activeTab === "history" && (
                    <div className="space-y-6">
                        {/* Redemptions */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Redemption Requests</h3>
                            {redemptionRequests.length === 0 ? (
                                <p className="text-gray-500">No redemption requests yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {redemptionRequests.map(req => (
                                        <div key={req.id} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <p className="font-bold text-gray-800">₹{req.amount} Redemption</p>
                                                <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                    req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Opt-Outs */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Opt-Out History</h3>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                                </div>
                            ) : optOuts.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No opt-outs yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {optOuts.map((optOut) => (
                                        <div
                                            key={optOut.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-pink-50 transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Calendar className="text-pink-600" size={20} />
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {new Date(optOut.date).toLocaleDateString()} - {optOut.shift}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Credits: ₹{optOut.creditEarned}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="text-green-600" size={20} />
                                                {new Date(optOut.date) > new Date() && (
                                                    <button
                                                        onClick={() => handleCancelOptOut(optOut.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Cancel opt-out"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Redeem Modal */}
                {showRedeemModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold mb-4">Redeem Credits</h3>
                            <form onSubmit={handleRedeem} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Amount to Redeem (₹)</label>
                                    <input
                                        type="number"
                                        max={credits}
                                        min="1"
                                        required
                                        value={redeemAmount}
                                        onChange={e => setRedeemAmount(e.target.value)}
                                        className="w-full border p-2 rounded"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Max: ₹{credits}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRedeemModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-pink-600 text-white py-2 rounded font-medium"
                                    >
                                        Redeem
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

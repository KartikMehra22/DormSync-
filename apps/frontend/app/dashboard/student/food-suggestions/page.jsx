"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowLeft, ThumbsUp, Send, Check, X, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function FoodSuggestionsPage() {
    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <SuggestionsContent />
        </ProtectedRoute>
    );
}

function SuggestionsContent() {
    const router = useRouter();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [form, setForm] = useState({
        foodItem: "",
        mealType: "LUNCH",
        description: "",
    });

    useEffect(() => {
        loadSuggestions();
    }, [filterStatus]);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = filterStatus !== "ALL" ? { status: filterStatus } : {};
            const res = await api.messSuggestion.getAll(token, params);
            setSuggestions(res.suggestions || []);
        } catch (error) {
            console.error("Error loading suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.messSuggestion.create(token, form);
            toast.success("Suggestion submitted successfully!");
            setForm({ foodItem: "", mealType: "LUNCH", description: "" });
            setShowForm(false);
            loadSuggestions();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to submit suggestion");
        }
    };

    const handleVote = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await api.messSuggestion.vote(token, id);
            toast.success("Vote recorded!");
            loadSuggestions();
        } catch (error) {
            toast.error(error.response?.data?.ERROR || "Failed to vote");
        }
    };

    return (
        <div className="p-8 bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-pink-100 rounded-lg transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mess Food Suggestions</h1>
                    <p className="text-gray-600">Suggest and vote on new menu items</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === status
                                    ? "bg-pink-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-pink-50"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-lg"
                >
                    <Send size={20} />
                    Suggest Food
                </button>
            </div>

            {/* Suggestion Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">New Food Suggestion</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Food Item *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.foodItem}
                                    onChange={(e) => setForm({ ...form, foodItem: e.target.value })}
                                    placeholder="e.g., Paneer Tikka, Ice Cream"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Meal Type *</label>
                                <select
                                    value={form.mealType}
                                    onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    <option value="BREAKFAST">Breakfast</option>
                                    <option value="LUNCH">Lunch</option>
                                    <option value="DINNER">Dinner</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Description (Optional)</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Why should this be added to the menu?"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 rounded-lg transition"
                            >
                                Submit Suggestion
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Suggestions List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-md text-center">
                    <Send size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No suggestions yet. Be the first to suggest!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className="bg-white p-6 rounded-xl shadow-md border border-pink-100 hover:shadow-lg transition"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{suggestion.foodItem}</h3>
                                    <p className="text-sm text-gray-500">by {suggestion.user.name}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${suggestion.status === "APPROVED"
                                            ? "bg-green-100 text-green-700"
                                            : suggestion.status === "REJECTED"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {suggestion.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-2">
                                    {suggestion.mealType}
                                </span>
                                {suggestion.description && (
                                    <p className="text-gray-600 text-sm mt-2">{suggestion.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <ThumbsUp size={18} />
                                    <span className="font-medium">{suggestion.votes} votes</span>
                                </div>
                                <button
                                    onClick={() => handleVote(suggestion.id)}
                                    className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-medium transition"
                                >
                                    Vote
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

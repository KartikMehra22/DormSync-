const { prisma } = require("../config/database");

// Create food suggestion (STUDENT)
async function createSuggestionController(req, res) {
    try {
        const userId = req.user.id;
        const { foodItem, mealType, description } = req.body;

        if (!foodItem || !mealType) {
            return res.status(400).json({
                ERROR: "Food item and meal type are required",
            });
        }

        const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER"];
        if (!validMealTypes.includes(mealType)) {
            return res.status(400).json({ ERROR: "Invalid meal type. Allowed: BREAKFAST, LUNCH, DINNER" });
        }

        const suggestion = await prisma.messSuggestion.create({
            data: {
                userId,
                foodItem,
                mealType,
                description: description || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Suggestion submitted successfully",
            suggestion,
        });
    } catch (error) {
        console.error("CreateSuggestion error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all suggestions (PUBLIC/WARDEN)
async function getAllSuggestionsController(req, res) {
    try {
        const { status, mealType } = req.query;

        const where = {};

        if (status) {
            const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ ERROR: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
            }
            where.status = status;
        }

        if (mealType) {
            const validMealTypes = ["BREAKFAST", "LUNCH", "DINNER"];
            if (!validMealTypes.includes(mealType)) {
                return res.status(400).json({ ERROR: `Invalid meal type. Allowed: ${validMealTypes.join(", ")}` });
            }
            where.mealType = mealType;
        }

        const suggestions = await prisma.messSuggestion.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
            orderBy: [
                { votes: "desc" },
                { createdAt: "desc" },
            ],
        });

        return res.status(200).json({
            message: "Suggestions fetched successfully",
            suggestions,
        });
    } catch (error) {
        console.error("GetAllSuggestions error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Vote on suggestion (STUDENT)
async function voteSuggestionController(req, res) {
    try {
        const { id } = req.params;

        const suggestion = await prisma.messSuggestion.update({
            where: { id: parseInt(id) },
            data: {
                votes: { increment: 1 },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Vote recorded successfully",
            suggestion,
        });
    } catch (error) {
        console.error("VoteSuggestion error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Suggestion not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update suggestion status (WARDEN)
async function updateSuggestionStatusController(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                ERROR: "Valid status required (PENDING, APPROVED, REJECTED)",
            });
        }

        const suggestion = await prisma.messSuggestion.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Suggestion status updated",
            suggestion,
        });
    } catch (error) {
        console.error("UpdateSuggestionStatus error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Suggestion not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Delete suggestion (WARDEN or OWN)
async function deleteSuggestionController(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const suggestion = await prisma.messSuggestion.findUnique({
            where: { id: parseInt(id) },
        });

        if (!suggestion) {
            return res.status(404).json({ ERROR: "Suggestion not found" });
        }

        // Only owner or warden can del ete
        if (suggestion.userId !== userId && !["WARDEN", "ADMIN"].includes(userRole)) {
            return res.status(403).json({
                ERROR: "You can only delete your own suggestions",
            });
        }

        await prisma.messSuggestion.delete({
            where: { id: parseInt(id) },
        });

        return res.status(200).json({
            message: "Suggestion deleted successfully",
        });
    } catch (error) {
        console.error("DeleteSuggestion error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    createSuggestionController,
    getAllSuggestionsController,
    voteSuggestionController,
    updateSuggestionStatusController,
    deleteSuggestionController,
};

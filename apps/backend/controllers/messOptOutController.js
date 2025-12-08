const { prisma } = require("../config/database");

// Opt out of a meal (STUDENT)
async function optOutOfMealController(req, res) {
    try {
        const userId = req.user.id;
        const { date, shift, creditEarned } = req.body;

        if (!date || !shift) {
            return res.status(400).json({
                ERROR: "Date and shift are required",
            });
        }

        const validShifts = ["BREAKFAST", "LUNCH", "DINNER"];
        if (!validShifts.includes(shift)) {
            return res.status(400).json({
                ERROR: "Invalid shift. Allowed: BREAKFAST, LUNCH, DINNER",
            });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Check if already opted out
        const existing = await prisma.messOptOut.findUnique({
            where: {
                userId_date_shift: {
                    userId,
                    date: targetDate,
                    shift,
                },
            },
        });

        if (existing) {
            return res.status(400).json({
                ERROR: "You have already opted out of this meal",
            });
        }

        // Prevent opt-out for past meals
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to midnight
        if (targetDate < now) {
            return res.status(400).json({
                ERROR: "Cannot opt out of past meals",
            });
        }

        const earnedCredits = creditEarned || 50; // Default credit value

        // Create opt-out and update user credits
        const optOut = await prisma.$transaction(async (tx) => {
            const newOptOut = await tx.messOptOut.create({
                data: {
                    userId,
                    date: targetDate,
                    shift,
                    creditEarned: earnedCredits,
                },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: earnedCredits },
                },
            });

            return newOptOut;
        });

        return res.status(201).json({
            message: `Opted out successfully! ${earnedCredits} credits added to your account`,
            optOut,
        });
    } catch (error) {
        console.error("OptOutOfMeal error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Cancel opt-out (STUDENT)
async function cancelOptOutController(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const optOut = await prisma.messOptOut.findUnique({
            where: { id: parseInt(id) },
        });

        if (!optOut) {
            return res.status(404).json({ ERROR: "Opt-out not found" });
        }

        if (optOut.userId !== userId) {
            return res.status(403).json({
                ERROR: "You can only cancel your own opt-outs",
            });
        }

        // Prevent cancellation for past meals
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (optOut.date < now) {
            return res.status(400).json({
                ERROR: "Cannot cancel opt-out for past meals",
            });
        }

        // Delete opt-out and deduct credits
        await prisma.$transaction(async (tx) => {
            await tx.messOptOut.delete({
                where: { id: parseInt(id) },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    credits: { decrement: optOut.creditEarned },
                },
            });
        });

        return res.status(200).json({
            message: "Opt-out cancelled successfully",
        });
    } catch (error) {
        console.error("CancelOptOut error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get student's opt-out history (STUDENT)
async function getMyOptOutsController(req, res) {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const where = { userId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const optOuts = await prisma.messOptOut.findMany({
            where,
            orderBy: {
                date: "desc",
            },
        });

        const totalCreditsEarned = optOuts.reduce(
            (sum, opt) => sum + opt.creditEarned,
            0
        );

        return res.status(200).json({
            message: "Opt-outs fetched successfully",
            optOuts,
            summary: {
                totalOptOuts: optOuts.length,
                totalCreditsEarned,
            },
        });
    } catch (error) {
        console.error("GetMyOptOuts error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all opt-outs (WARDEN)
async function getAllOptOutsController(req, res) {
    try {
        const { date, shift } = req.query;

        const where = {};
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            where.date = targetDate;
        }
        if (shift) where.shift = shift;

        const optOuts = await prisma.messOptOut.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ date: "desc" }, { shift: "asc" }],
        });

        return res.status(200).json({
            message: "Opt-outs fetched successfully",
            optOuts,
            summary: {
                total: optOuts.length,
            },
        });
    } catch (error) {
        console.error("GetAllOptOuts error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get user's credits and redemption history (STUDENT)
async function getMyCreditsController(req, res) {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                credits: true,
                messOptOuts: {
                    orderBy: {
                        optedOutAt: "desc",
                    },
                    take: 20,
                },
            },
        });

        return res.status(200).json({
            message: "Credits fetched successfully",
            totalCredits: user.credits,
            recentOptOuts: user.messOptOuts,
        });
    } catch (error) {
        console.error("GetMyCredits error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    optOutOfMealController,
    cancelOptOutController,
    getMyOptOutsController,
    getAllOptOutsController,
    getMyCreditsController,
};

const { prisma } = require("../config/database");

// Request redemption (STUDENT)
async function requestRedemptionController(req, res) {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ ERROR: "Invalid amount" });
        }

        // Transaction: Check balance, Deduct credits, Create request
        const request = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });

            if (user.credits < amount) {
                throw new Error("Insufficient credits");
            }

            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: parseFloat(amount) } }
            });

            return await tx.redemptionRequest.create({
                data: {
                    userId,
                    amount: parseFloat(amount),
                    status: "PENDING"
                }
            });
        });

        return res.status(201).json({
            message: "Redemption request created successfully",
            request
        });

    } catch (error) {
        console.error("RequestRedemption error:", error);
        if (error.message === "Insufficient credits") {
            return res.status(400).json({ ERROR: "Insufficient credits" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Process redemption (WARDEN)
async function processRedemptionController(req, res) {
    try {
        const { id } = req.params;
        const { action } = req.body; // "approve" or "reject"
        const wardenId = req.user.id;

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({ ERROR: "Invalid action" });
        }

        const request = await prisma.redemptionRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request) return res.status(404).json({ ERROR: "Request not found" });
        if (request.status !== "PENDING") return res.status(400).json({ ERROR: "Request already processed" });

        const updatedRequest = await prisma.$transaction(async (tx) => {
            let status = action === "approve" ? "APPROVED" : "REJECTED";

            // If rejected, refund credits
            if (action === "reject") {
                await tx.user.update({
                    where: { id: request.userId },
                    data: { credits: { increment: request.amount } }
                });
            }

            return await tx.redemptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status,
                    processedBy: wardenId
                },
                include: { user: { select: { name: true, email: true } } }
            });
        });

        return res.status(200).json({
            message: `Request ${action}ed successfully`,
            request: updatedRequest
        });

    } catch (error) {
        console.error("ProcessRedemption error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get my redemptions (STUDENT)
async function getMyRedemptionsController(req, res) {
    try {
        const userId = req.user.id;
        const requests = await prisma.redemptionRequest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json({ requests });
    } catch (error) {
        console.error("GetMyRedemptions error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all redemptions (WARDEN)
async function getAllRedemptionsController(req, res) {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const requests = await prisma.redemptionRequest.findMany({
            where,
            include: { user: { select: { id: true, name: true, username: true, email: true } } },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json({ requests });
    } catch (error) {
        console.error("GetAllRedemptions error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    requestRedemptionController,
    processRedemptionController,
    getMyRedemptionsController,
    getAllRedemptionsController
};

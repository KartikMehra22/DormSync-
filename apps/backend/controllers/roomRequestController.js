const { prisma } = require("../config/database");

// Get student's room requests
async function getMyRequestsController(req, res) {
    try {
        const userId = req.user.id;

        const requests = await prisma.roomRequest.findMany({
            where: { userId },
            include: {
                requestedRoom: {
                    include: {
                        block: true,
                    },
                },
            },
            orderBy: {
                requestedAt: "desc",
            },
        });

        return res.status(200).json({
            message: "Room requests fetched successfully",
            requests,
        });
    } catch (error) {
        console.error("GetMyRequests error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Create room change request (STUDENT)
async function createRoomRequestController(req, res) {
    try {
        const userId = req.user.id;
        const { requestedRoomId, reason } = req.body;

        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({
                ERROR: "Please provide a detailed reason (minimum 10 characters)",
            });
        }

        // Get current room allocation
        const currentAllocation = await prisma.roomAllocation.findFirst({
            where: {
                userId,
                status: "ACTIVE",
            },
        });

        const request = await prisma.roomRequest.create({
            data: {
                userId,
                requestedRoomId: requestedRoomId ? parseInt(requestedRoomId) : null,
                currentRoomId: currentAllocation?.roomId,
                reason: reason.trim(),
            },
            include: {
                requestedRoom: {
                    include: {
                        block: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Room request submitted successfully",
            request,
        });
    } catch (error) {
        console.error("CreateRoomRequest error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all room requests (WARDEN)
async function getAllRequestsController(req, res) {
    try {
        const { status } = req.query;

        const where = {};
        if (status) where.status = status;

        const requests = await prisma.roomRequest.findMany({
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
                requestedRoom: {
                    include: {
                        block: true,
                    },
                },
            },
            orderBy: {
                requestedAt: "desc",
            },
        });

        return res.status(200).json({
            message: "Room requests fetched successfully",
            requests,
        });
    } catch (error) {
        console.error("GetAllRequests error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Approve room request (WARDEN)
async function approveRequestController(req, res) {
    try {
        const { id } = req.params;
        const wardenlId = req.user.id;
        const { remarks } = req.body;

        const request = await prisma.roomRequest.findUnique({
            where: { id: parseInt(id) },
        });

        if (!request) {
            return res.status(404).json({ ERROR: "Request not found" });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                ERROR: "Only pending requests can be approved",
            });
        }

        const updatedRequest = await prisma.roomRequest.update({
            where: { id: parseInt(id) },
            data: {
                status: "APPROVED",
                resolvedAt: new Date(),
                resolvedBy: wardenId,
                remarks: remarks || "Request approved",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                    },
                },
                requestedRoom: {
                    include: {
                        block: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Room request approved successfully",
            request: updatedRequest,
        });
    } catch (error) {
        console.error("ApproveRequest error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Reject room request (WARDEN)
async function rejectRequestController(req, res) {
    try {
        const { id } = req.params;
        const wardenId = req.user.id;
        const { remarks } = req.body;

        if (!remarks || remarks.trim().length < 5) {
            return res.status(400).json({
                ERROR: "Please provide a reason for rejection (minimum 5 characters)",
            });
        }

        const request = await prisma.roomRequest.findUnique({
            where: { id: parseInt(id) },
        });

        if (!request) {
            return res.status(404).json({ ERROR: "Request not found" });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                ERROR: "Only pending requests can be rejected",
            });
        }

        const updatedRequest = await prisma.roomRequest.update({
            where: { id: parseInt(id) },
            data: {
                status: "REJECTED",
                resolvedAt: new Date(),
                resolvedBy: wardenId,
                remarks: remarks.trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                    },
                },
                requestedRoom: {
                    include: {
                        block: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Room request rejected",
            request: updatedRequest,
        });
    } catch (error) {
        console.error("RejectRequest error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getMyRequestsController,
    createRoomRequestController,
    getAllRequestsController,
    approveRequestController,
    rejectRequestController,
};

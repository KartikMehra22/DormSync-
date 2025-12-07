const { prisma } = require("../config/database");

// Get student's current room allocation
async function getMyRoomController(req, res) {
    try {
        const userId = req.user.id;

        const allocation = await prisma.roomAllocation.findUnique({
            where: { userId },
            include: {
                room: {
                    include: {
                        block: true,
                        allocations: {
                            where: { status: "ACTIVE" },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!allocation) {
            return res.status(404).json({
                message: "No room allocated yet",
                allocation: null,
            });
        }

        return res.status(200).json({
            message: "Room allocation fetched successfully",
            allocation,
        });
    } catch (error) {
        console.error("GetMyRoom error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all room allocations (WARDEN)
async function getAllAllocationsController(req, res) {
    try {
        const { blockId, status } = req.query;

        const where = {};
        if (status) where.status = status;

        const allocations = await prisma.roomAllocation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        role: true,
                    },
                },
                room: {
                    include: {
                        block: true,
                    },
                },
            },
            orderBy: {
                allocatedAt: "desc",
            },
        });

        // Filter by blockId if provided
        let filteredAllocations = allocations;
        if (blockId) {
            filteredAllocations = allocations.filter(
                (a) => a.room.blockId === parseInt(blockId)
            );
        }

        return res.status(200).json({
            message: "Allocations fetched successfully",
            allocations: filteredAllocations,
        });
    } catch (error) {
        console.error("GetAllAllocations error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Allocate room to student (WARDEN)
async function allocateRoomController(req, res) {
    try {
        const { userId, roomId } = req.body;

        if (!userId || !roomId) {
            return res.status(400).json({
                ERROR: "User ID and Room ID are required",
            });
        }

        // Check if user already has an active allocation
        const existingAllocation = await prisma.roomAllocation.findFirst({
            where: {
                userId: parseInt(userId),
                status: "ACTIVE",
            },
        });

        if (existingAllocation) {
            return res.status(400).json({
                ERROR: "User already has an active room allocation",
            });
        }

        // Check if room is available
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomId) },
            include: {
                allocations: {
                    where: { status: "ACTIVE" },
                },
            },
        });

        if (!room) {
            return res.status(404).json({ ERROR: "Room not found" });
        }

        if (room.allocations.length >= room.capacity) {
            return res.status(400).json({
                ERROR: "Room is already at full capacity",
            });
        }

        // Create allocation and update room occupancy
        const allocation = await prisma.$transaction(async (tx) => {
            const newAllocation = await tx.roomAllocation.create({
                data: {
                    userId: parseInt(userId),
                    roomId: parseInt(roomId),
                    status: "ACTIVE",
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
                    room: {
                        include: {
                            block: true,
                        },
                    },
                },
            });

            await tx.room.update({
                where: { id: parseInt(roomId) },
                data: {
                    occupied: { increment: 1 },
                    status:
                        room.occupied + 1 >= room.capacity
                            ? "OCCUPIED"
                            : "AVAILABLE",
                },
            });

            return newAllocation;
        });

        return res.status(201).json({
            message: "Room allocated successfully",
            allocation,
        });
    } catch (error) {
        console.error("AllocateRoom error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Vacate room (WARDEN)
async function vacateRoomController(req, res) {
    try {
        const { id } = req.params;

        const allocation = await prisma.roomAllocation.findUnique({
            where: { id: parseInt(id) },
            include: { room: true },
        });

        if (!allocation) {
            return res.status(404).json({ ERROR: "Allocation not found" });
        }

        if (allocation.status === "VACATED") {
            return res.status(400).json({
                ERROR: "Room is already vacated",
            });
        }

        const updatedAllocation = await prisma.$transaction(async (tx) => {
            const updated = await tx.roomAllocation.update({
                where: { id: parseInt(id) },
                data: {
                    status: "VACATED",
                    vacatedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                        },
                    },
                    room: {
                        include: {
                            block: true,
                        },
                    },
                },
            });

            const newOccupied = Math.max(0, allocation.room.occupied - 1);
            await tx.room.update({
                where: { id: allocation.roomId },
                data: {
                    occupied: { decrement: 1 },
                    status: newOccupied < allocation.room.capacity ? "AVAILABLE" : "OCCUPIED",
                },
            });

            return updated;
        });

        return res.status(200).json({
            message: "Room vacated successfully",
            allocation: updatedAllocation,
        });
    } catch (error) {
        console.error("VacateRoom error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getMyRoomController,
    getAllAllocationsController,
    allocateRoomController,
    vacateRoomController,
};

const { prisma } = require("../config/database");

// Get all rooms with filters
async function getAllRoomsController(req, res) {
    try {
        const { blockId, floor, status, available } = req.query;

        const where = {};
        if (blockId) where.blockId = parseInt(blockId);
        if (floor) where.floor = parseInt(floor);
        if (status) where.status = status;
        if (available === "true") {
            where.status = "AVAILABLE";
            where.occupied = { lt: prisma.room.fields.capacity };
        }

        const rooms = await prisma.room.findMany({
            where,
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
            orderBy: [{ blockId: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
        });

        return res.status(200).json({
            message: "Rooms fetched successfully",
            rooms,
        });
    } catch (error) {
        console.error("GetAllRooms error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get specific room details
async function getRoomController(req, res) {
    try {
        const { id } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: parseInt(id) },
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
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!room) {
            return res.status(404).json({ ERROR: "Room not found" });
        }

        return res.status(200).json({
            message: "Room fetched successfully",
            room,
        });
    } catch (error) {
        console.error("GetRoom error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Create room (WARDEN)
async function createRoomController(req, res) {
    try {
        let { blockId, roomNumber, floor, capacity } = req.body;

        if (!blockId || !roomNumber || floor === undefined) {
            return res.status(400).json({
                ERROR: "Block ID, room number, and floor are required",
            });
        }

        // Enforce fixed capacity of 2 students per room
        capacity = 2;

        // Check if block exists
        const block = await prisma.block.findUnique({
            where: { id: parseInt(blockId) },
        });

        if (!block) {
            return res.status(404).json({ ERROR: "Block not found" });
        }

        // Check if room number already exists in this block
        const existingRoom = await prisma.room.findFirst({
            where: {
                blockId: parseInt(blockId),
                roomNumber: roomNumber.toString(),
            },
        });

        if (existingRoom) {
            return res.status(400).json({
                ERROR: "Room number already exists in this block",
            });
        }

        const room = await prisma.room.create({
            data: {
                blockId: parseInt(blockId),
                roomNumber: roomNumber.toString(),
                floor: parseInt(floor),
                capacity: 2, // Fixed capacity
                occupied: 0,
                status: "AVAILABLE",
            },
            include: {
                block: true,
            },
        });

        return res.status(201).json({
            message: "Room created successfully",
            room,
        });
    } catch (error) {
        console.error("CreateRoom error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update room (WARDEN/ADMIN only)
async function updateRoomController(req, res) {
    try {
        const { id } = req.params;
        const { roomNumber, floor, capacity, type, status } = req.body;

        const updateData = {};
        if (roomNumber) updateData.roomNumber = roomNumber;
        if (floor) updateData.floor = parseInt(floor);
        if (capacity) updateData.capacity = parseInt(capacity);
        if (type !== undefined) updateData.type = type;
        if (status) updateData.status = status;

        const room = await prisma.room.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                block: true,
            },
        });

        return res.status(200).json({
            message: "Room updated successfully",
            room,
        });
    } catch (error) {
        console.error("UpdateRoom error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Room not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Delete room (ADMIN only)
async function deleteRoomController(req, res) {
    try {
        const { id } = req.params;

        await prisma.room.delete({
            where: { id: parseInt(id) },
        });

        return res.status(200).json({
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("DeleteRoom error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Room not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Bulk create rooms (WARDEN)
async function createBulkRoomsController(req, res) {
    try {
        const { blockId, floor, count, capacity } = req.body;

        if (!blockId || floor === undefined || !count) {
            return res.status(400).json({
                ERROR: "Block ID, floor, and count are required",
            });
        }

        const block = await prisma.block.findUnique({
            where: { id: parseInt(blockId) },
        });

        if (!block) {
            return res.status(404).json({ ERROR: "Block not found" });
        }

        const createdRooms = [];
        const skippedRooms = [];

        // Generate rooms sequentially: 101, 102, ... for floor 1
        // 201, 202, ... for floor 2
        for (let i = 1; i <= parseInt(count); i++) {
            const roomNumVal = (parseInt(floor) * 100) + i;
            const roomNumber = roomNumVal.toString();

            // Check if exists
            const existing = await prisma.room.findFirst({
                where: {
                    blockId: parseInt(blockId),
                    roomNumber: roomNumber,
                },
            });

            if (existing) {
                skippedRooms.push(roomNumber);
                continue;
            }

            const room = await prisma.room.create({
                data: {
                    blockId: parseInt(blockId),
                    roomNumber: roomNumber,
                    floor: parseInt(floor),
                    capacity: capacity ? parseInt(capacity) : 2,
                    occupied: 0,
                    status: "AVAILABLE",
                },
            });
            createdRooms.push(room);
        }

        return res.status(201).json({
            message: `Created ${createdRooms.length} rooms. Skipped ${skippedRooms.length} existing rooms.`,
            createdRooms,
            skippedRooms,
        });

    } catch (error) {
        console.error("CreateBulkRooms error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getAllRoomsController,
    getRoomController,
    createRoomController,
    updateRoomController,
    deleteRoomController,
    createBulkRoomsController,
};


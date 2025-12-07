const { prisma } = require("../config/database");

// Get all blocks
async function getAllBlocksController(req, res) {
    try {
        const blocks = await prisma.block.findMany({
            include: {
                rooms: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return res.status(200).json({
            message: "Blocks fetched successfully",
            blocks,
        });
    } catch (error) {
        console.error("GetAllBlocks error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Create a new block (WARDEN/ADMIN only)
async function createBlockController(req, res) {
    try {
        const { name, totalFloors, description } = req.body;

        if (!name || !totalFloors) {
            return res.status(400).json({
                ERROR: "Block name and total floors are required",
            });
        }

        const existingBlock = await prisma.block.findUnique({
            where: { name },
        });

        if (existingBlock) {
            return res.status(400).json({
                ERROR: "Block with this name already exists",
            });
        }

        const block = await prisma.block.create({
            data: {
                name,
                totalFloors: parseInt(totalFloors),
                description,
            },
        });

        return res.status(201).json({
            message: "Block created successfully",
            block,
        });
    } catch (error) {
        console.error("CreateBlock error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update block (WARDEN/ADMIN only)
async function updateBlockController(req, res) {
    try {
        const { id } = req.params;
        const { name, totalFloors, description } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (totalFloors) updateData.totalFloors = parseInt(totalFloors);
        if (description !== undefined) updateData.description = description;

        const block = await prisma.block.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return res.status(200).json({
            message: "Block updated successfully",
            block,
        });
    } catch (error) {
        console.error("UpdateBlock error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Block not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Delete block (ADMIN only)
async function deleteBlockController(req, res) {
    try {
        const { id } = req.params;

        await prisma.block.delete({
            where: { id: parseInt(id) },
        });

        return res.status(200).json({
            message: "Block deleted successfully",
        });
    } catch (error) {
        console.error("DeleteBlock error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Block not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getAllBlocksController,
    createBlockController,
    updateBlockController,
    deleteBlockController,
};

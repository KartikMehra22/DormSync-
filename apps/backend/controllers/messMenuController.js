const { prisma } = require("../config/database");

// Get menu for specific date and shift
async function getMessMenuController(req, res) {
    try {
        const { date, shift } = req.query;

        if (!date || !shift) {
            return res.status(400).json({
                ERROR: "Date and shift are required",
            });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const menu = await prisma.messMenu.findUnique({
            where: {
                date_shift: {
                    date: targetDate,
                    shift,
                },
            },
        });

        if (!menu) {
            return res.status(404).json({
                message: "No menu found for the specified date and shift",
                menu: null,
            });
        }

        return res.status(200).json({
            message: "Menu fetched successfully",
            menu,
        });
    } catch (error) {
        console.error("GetMessMenu error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Create or update menu (WARDEN/ADMIN)
async function createOrUpdateMenuController(req, res) {
    try {
        const { date, shift, items, description } = req.body;

        if (!date || !shift || !items || items.length === 0) {
            return res.status(400).json({
                ERROR: "Date, shift, and items are required",
            });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const menu = await prisma.messMenu.upsert({
            where: {
                date_shift: {
                    date: targetDate,
                    shift,
                },
            },
            update: {
                items,
                description,
            },
            create: {
                date: targetDate,
                shift,
                items,
                description,
            },
        });

        return res.status(200).json({
            message: "Menu saved successfully",
            menu,
        });
    } catch (error) {
        console.error("CreateOrUpdateMenu error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Delete menu (WARDEN/ADMIN)
async function deleteMenuController(req, res) {
    try {
        const { id } = req.params;

        await prisma.messMenu.delete({
            where: { id: parseInt(id) },
        });

        return res.status(200).json({
            message: "Menu deleted successfully",
        });
    } catch (error) {
        console.error("DeleteMenu error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Menu not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getMessMenuController,
    createOrUpdateMenuController,
    deleteMenuController,
};

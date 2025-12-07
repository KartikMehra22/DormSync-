const { prisma } = require("../config/database");

// Get menu (Single or List)
async function getMessMenuController(req, res) {
    try {
        const { date, shift, limit } = req.query;

        // Case 1: Get specific menu item
        if (date && shift) {
            const validShifts = ["BREAKFAST", "LUNCH", "DINNER"];
            if (!validShifts.includes(shift)) {
                return res.status(400).json({ ERROR: "Invalid shift. Allowed: BREAKFAST, LUNCH, DINNER" });
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
        }

        // Case 2: Get list of menu items
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const take = limit ? parseInt(limit) : undefined;
        // If limit is provided, assumed detailed daily items * 3 shifts roughly or distinct days? 
        // Frontend uses limit=7 for "weekly menu". Maybe it expects 7 days worth?
        // Or 7 items?
        // Let's return upcoming menus.

        const menuItems = await prisma.messMenu.findMany({
            where: {
                date: {
                    gte: today
                }
            },
            orderBy: [
                { date: 'asc' },
                { shift: 'asc' } // Custom order helper might be needed if shift is enum, but alpha sort is okay for now
            ],
            take: take ? take * 3 : undefined, // Assuming 3 meals per day, limit usually implies days in this context? 
            // Or if limit=7 means 7 records. Let's stick to simple record count if limit is small.
            // If limit is 7, frontend likely implies 7 items.
            // But wait, the frontend usage is 'limit: 7'. 
            // In the frontend code, it groups by date. 
            // If I return 7 records, that's 2.3 days. 
            // Let's assume limit refers to *days* or just ignore limit scaling and return strict count.
            // Safest to just return 'take: limit' if provided.
        });

        return res.status(200).json({
            message: "Menu list fetched successfully",
            menu: menuItems, // Frontend expects this key
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

        const validShifts = ["BREAKFAST", "LUNCH", "DINNER"];
        if (!validShifts.includes(shift)) {
            return res.status(400).json({ ERROR: "Invalid shift. Allowed: BREAKFAST, LUNCH, DINNER" });
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

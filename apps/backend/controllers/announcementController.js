const { prisma } = require("../config/database");

// Get all active announcements
async function getAllAnnouncementsController(req, res) {
    try {
        const { category } = req.query;

        const where = {};
        if (category) where.category = category;

        // Only show non-expired announcements
        const now = new Date();
        where.OR = [
            { expiresAt: null },
            { expiresAt: { gte: now } }
        ];

        const announcements = await prisma.announcement.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: [
                { priority: "desc" },
                { createdAt: "desc" },
            ],
        });

        return res.status(200).json({
            message: "Announcements fetched successfully",
            announcements,
        });
    } catch (error) {
        console.error("GetAllAnnouncements error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get specific announcement
async function getAnnouncementController(req, res) {
    try {
        const { id } = req.params;

        const announcement = await prisma.announcement.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        if (!announcement) {
            return res.status(404).json({ ERROR: "Announcement not found" });
        }

        return res.status(200).json({
            message: "Announcement fetched successfully",
            announcement,
        });
    } catch (error) {
        console.error("GetAnnouncement error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Create announcement (WARDEN/ADMIN)
async function createAnnouncementController(req, res) {
    try {
        const postedBy = req.user.id;
        const { title, content, category, priority, expiresAt, attachments } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                ERROR: "Title, content, and category are required",
            });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                category,
                priority: priority || false,
                postedBy,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                attachments: attachments || [],
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Announcement created successfully",
            announcement,
        });
    } catch (error) {
        console.error("CreateAnnouncement error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update announcement (WARDEN/ADMIN)
async function updateAnnouncementController(req, res) {
    try {
        const { id } = req.params;
        const { title, content, category, priority, expiresAt, attachments } = req.body;

        const updateData = {};
        if (title) updateData.title = title.trim();
        if (content) updateData.content = content.trim();
        if (category) updateData.category = category;
        if (priority !== undefined) updateData.priority = priority;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (attachments !== undefined) updateData.attachments = attachments;

        const announcement = await prisma.announcement.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Announcement updated successfully",
            announcement,
        });
    } catch (error) {
        console.error("UpdateAnnouncement error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Announcement not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Delete announcement (WARDEN/ADMIN)
async function deleteAnnouncementController(req, res) {
    try {
        const { id } = req.params;

        await prisma.announcement.delete({
            where: { id: parseInt(id) },
        });

        return res.status(200).json({
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        console.error("DeleteAnnouncement error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Announcement not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    getAllAnnouncementsController,
    getAnnouncementController,
    createAnnouncementController,
    updateAnnouncementController,
    deleteAnnouncementController,
};

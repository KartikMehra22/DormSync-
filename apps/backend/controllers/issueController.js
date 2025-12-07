const { prisma } = require("../config/database");

// Report an issue (STUDENT)
async function createIssueController(req, res) {
    try {
        const userId = req.user.id;
        const { title, description, category, priority, attachments } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                ERROR: "Title, description, and category are required",
            });
        }

        const issue = await prisma.issue.create({
            data: {
                userId,
                title: title.trim(),
                description: description.trim(),
                category,
                priority: priority || "MEDIUM",
                attachments: attachments || [],
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
            },
        });

        return res.status(201).json({
            message: "Issue reported successfully",
            issue,
        });
    } catch (error) {
        console.error("CreateIssue error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get student's issues (STUDENT)
async function getMyIssuesController(req, res) {
    try {
        const userId = req.user.id;
        const { status, category } = req.query;

        const where = { userId };

        // Validate and apply filters
        if (status) {
            const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ ERROR: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
            }
            where.status = status;
        }

        if (category) {
            const validCategories = ["MAINTENANCE", "ELECTRICAL", "PLUMBING", "CLEANING", "FURNITURE", "INTERNET", "OTHER"];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ ERROR: `Invalid category. Allowed: ${validCategories.join(", ")}` });
            }
            where.category = category;
        }

        const issues = await prisma.issue.findMany({
            where,
            orderBy: {
                reportedAt: "desc",
            },
        });

        return res.status(200).json({
            message: "Issues fetched successfully",
            issues,
        });
    } catch (error) {
        console.error("GetMyIssues error:", error.message);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all issues (WARDEN)
async function getAllIssuesController(req, res) {
    try {
        const { status, category, priority } = req.query;

        const where = {};

        if (status) {
            const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ ERROR: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
            }
            where.status = status;
        }

        if (category) {
            const validCategories = ["MAINTENANCE", "ELECTRICAL", "PLUMBING", "CLEANING", "FURNITURE", "INTERNET", "OTHER"];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ ERROR: `Invalid category. Allowed: ${validCategories.join(", ")}` });
            }
            where.category = category;
        }

        if (priority) {
            const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ ERROR: `Invalid priority. Allowed: ${validPriorities.join(", ")}` });
            }
            where.priority = priority;
        }

        const issues = await prisma.issue.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        roomAllocation: {
                            where: { status: "ACTIVE" },
                            include: {
                                room: {
                                    include: {
                                        block: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { priority: "desc" },
                { reportedAt: "desc" },
            ],
        });

        return res.status(200).json({
            message: "Issues fetched successfully",
            issues,
        });
    } catch (error) {
        console.error("GetAllIssues error:", error.message);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get specific issue details
async function getIssueController(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const issue = await prisma.issue.findUnique({
            where: { id: parseInt(id) },
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
        });

        if (!issue) {
            return res.status(404).json({ ERROR: "Issue not found" });
        }

        // Students can only view their own issues
        if (userRole === "STUDENT" && issue.userId !== userId) {
            return res.status(403).json({
                ERROR: "You can only view your own issues",
            });
        }

        return res.status(200).json({
            message: "Issue fetched successfully",
            issue,
        });
    } catch (error) {
        console.error("GetIssue error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update issue status (WARDEN)
async function updateIssueStatusController(req, res) {
    try {
        const { id } = req.params;
        const wardenId = req.user.id;
        const { status, remarks } = req.body;

        if (!status) {
            return res.status(400).json({
                ERROR: "Status is required",
            });
        }

        const updateData = { status };
        if (remarks) updateData.remarks = remarks;
        if (status === "RESOLVED" || status === "CLOSED") {
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = wardenId;
        }

        const issue = await prisma.issue.update({
            where: { id: parseInt(id) },
            data: updateData,
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
        });

        return res.status(200).json({
            message: "Issue status updated successfully",
            issue,
        });
    } catch (error) {
        console.error("UpdateIssueStatus error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Issue not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Resolve issue (WARDEN)
async function resolveIssueController(req, res) {
    try {
        const { id } = req.params;
        const wardenId = req.user.id;
        const { remarks } = req.body;

        const issue = await prisma.issue.update({
            where: { id: parseInt(id) },
            data: {
                status: "RESOLVED",
                resolvedAt: new Date(),
                resolvedBy: wardenId,
                remarks: remarks || "Issue resolved",
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
            },
        });

        return res.status(200).json({
            message: "Issue resolved successfully",
            issue,
        });
    } catch (error) {
        console.error("ResolveIssue error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Issue not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    createIssueController,
    getMyIssuesController,
    getAllIssuesController,
    getIssueController,
    updateIssueStatusController,
    resolveIssueController,
};

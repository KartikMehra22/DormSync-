const { prisma } = require("../config/database");

// Student check-in (STUDENT only)
async function checkInController(req, res) {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check time restriction - only after 9 PM
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour < 21) { // 21 = 9 PM in 24-hour format
            return res.status(400).json({
                ERROR: "Check-in is only allowed after 9:00 PM",
            });
        }

        // Check if already checked in today
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: today,
            },
        });

        if (existingAttendance) {
            return res.status(400).json({
                ERROR: "You have already checked in for today",
            });
        }

        // Create attendance record
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: today,
                checkInTime: new Date(),
                status: "PRESENT",
            },
        });

        return res.status(201).json({
            message: "Checked in successfully",
            attendance,
        });
    } catch (error) {
        console.error("CheckIn error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get student's attendance history
async function getMyAttendanceController(req, res) {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const where = { userId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const attendance = await prisma.attendance.findMany({
            where,
            orderBy: {
                date: "desc",
            },
        });

        const summary = {
            total: attendance.length,
            present: attendance.filter((a) => a.status === "PRESENT").length,
            absent: attendance.filter((a) => a.status === "ABSENT").length,
            late: attendance.filter((a) => a.status === "LATE").length,
            onLeave: attendance.filter((a) => a.status === "ON_LEAVE").length,
        };

        return res.status(200).json({
            message: "Attendance fetched successfully",
            attendance,
            summary,
        });
    } catch (error) {
        console.error("GetMyAttendance error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get all attendance records (WARDEN)
async function getAllAttendanceController(req, res) {
    try {
        const { date, status, blockId } = req.query;

        const where = {};

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            where.date = targetDate;
        }

        if (status) {
            where.status = status;
        }

        const attendance = await prisma.attendance.findMany({
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
            orderBy: [{ date: "desc" }, { checkInTime: "asc" }],
        });

        // Filter by blockId if provided
        let filteredAttendance = attendance;
        if (blockId) {
            filteredAttendance = attendance.filter(
                (a) =>
                    a.user.roomAllocation &&
                    a.user.roomAllocation.room.blockId === parseInt(blockId)
            );
        }

        return res.status(200).json({
            message: "Attendance records fetched successfully",
            attendance: filteredAttendance,
        });
    } catch (error) {
        console.error("GetAllAttendance error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Manually mark attendance (WARDEN)
async function manualAttendanceController(req, res) {
    try {
        const { userId, userName, date, status, checkInTime, checkOutTime, remarks } = req.body;

        if ((!userId && !userName) || !date || !status) {
            return res.status(400).json({
                ERROR: "Student identifier (userId or userName), date, and status are required",
            });
        }

        let studentId = userId;

        // If userName provided, find the user
        if (!studentId && userName) {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { name: { contains: userName, mode: "insensitive" } },
                        { username: { contains: userName, mode: "insensitive" } },
                        { email: { contains: userName, mode: "insensitive" } },
                    ],
                    role: "STUDENT",
                },
            });

            if (!user) {
                return res.status(404).json({
                    ERROR: `No student found with name/username/email: ${userName}`,
                });
            }

            studentId = user.id;
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists
        const existing = await prisma.attendance.findFirst({
            where: {
                userId: parseInt(studentId),
                date: targetDate,
            },
        });

        // Determine data payload
        const dataPayload = {
            status,
            remarks: remarks || null,
        };

        if (checkInTime !== undefined) dataPayload.checkInTime = checkInTime ? new Date(checkInTime) : null;
        if (checkOutTime !== undefined) dataPayload.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;

        // Default behavior: if marking PRESENT and no checkInTime provided, use now (only for new records)
        if (!existing && status === "PRESENT" && checkInTime === undefined) {
            dataPayload.checkInTime = new Date();
        }

        let attendance;
        if (existing) {
            // Update existing
            attendance = await prisma.attendance.update({
                where: { id: existing.id },
                data: dataPayload,
                include: {
                    user: { select: { id: true, name: true, username: true, email: true } },
                },
            });
        } else {
            // Create new
            attendance = await prisma.attendance.create({
                data: {
                    userId: parseInt(studentId),
                    date: targetDate,
                    ...dataPayload,
                },
                include: {
                    user: { select: { id: true, name: true, username: true, email: true } },
                },
            });
        }

        return res.status(200).json({
            message: "Attendance marked successfully",
            attendance,
        });
    } catch (error) {
        console.error("ManualAttendance error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Update attendance record (WARDEN)
async function updateAttendanceController(req, res) {
    try {
        const { id } = req.params;
        const wardenId = req.user.id;
        const { status, remarks, checkInTime, checkOutTime } = req.body;

        const updateData = { markedBy: wardenId };
        if (status) updateData.status = status;
        if (remarks !== undefined) updateData.remarks = remarks;
        if (checkInTime !== undefined) updateData.checkInTime = checkInTime ? new Date(checkInTime) : null;
        if (checkOutTime !== undefined) updateData.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;

        const attendance = await prisma.attendance.update({
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
            message: "Attendance updated successfully",
            attendance,
        });
    } catch (error) {
        console.error("UpdateAttendance error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ ERROR: "Attendance record not found" });
        }
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

// Get attendance reports (WARDEN)
async function getAttendanceReportsController(req, res) {
    try {
        const { startDate, endDate, blockId } = req.query;

        const where = {};
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
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
        });

        // Filter by blockId if provided
        let filteredAttendance = attendance;
        if (blockId) {
            filteredAttendance = attendance.filter(
                (a) =>
                    a.user.roomAllocation?.length > 0 &&
                    a.user.roomAllocation[0].room.blockId === parseInt(blockId)
            );
        }

        // Generate summary
        const summary = {
            totalRecords: filteredAttendance.length,
            present: filteredAttendance.filter((a) => a.status === "PRESENT").length,
            absent: filteredAttendance.filter((a) => a.status === "ABSENT").length,
            late: filteredAttendance.filter((a) => a.status === "LATE").length,
            onLeave: filteredAttendance.filter((a) => a.status === "ON_LEAVE").length,
        };

        const percentages = {
            presentPercentage:
                summary.totalRecords > 0
                    ? ((summary.present / summary.totalRecords) * 100).toFixed(2)
                    : 0,
            absentPercentage:
                summary.totalRecords > 0
                    ? ((summary.absent / summary.totalRecords) * 100).toFixed(2)
                    : 0,
        };

        return res.status(200).json({
            message: "Attendance report generated successfully",
            summary: { ...summary, ...percentages },
            attendance: filteredAttendance,
        });
    } catch (error) {
        console.error("GetAttendanceReports error:", error);
        return res.status(500).json({ ERROR: "Internal Server Error" });
    }
}

module.exports = {
    checkInController,
    getMyAttendanceController,
    getAllAttendanceController,
    manualAttendanceController,
    updateAttendanceController,
    getAttendanceReportsController,
};

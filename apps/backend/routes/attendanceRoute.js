const express = require("express");
const attendanceRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    checkInController,
    getMyAttendanceController,
    getAllAttendanceController,
    manualAttendanceController,
    updateAttendanceController,
    getAttendanceReportsController,
} = require("../controllers/attendanceController");

// Student routes
attendanceRouter.post("/check-in", authenticate, authorizeRoles("STUDENT"), checkInController);
attendanceRouter.get("/my-attendance", authenticate, authorizeRoles("STUDENT"), getMyAttendanceController);

// Warden routes
attendanceRouter.get("/", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAllAttendanceController);
attendanceRouter.post("/mark", authenticate, authorizeRoles("WARDEN", "ADMIN"), manualAttendanceController);
attendanceRouter.put("/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateAttendanceController);
attendanceRouter.get("/reports", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAttendanceReportsController);

module.exports = attendanceRouter;

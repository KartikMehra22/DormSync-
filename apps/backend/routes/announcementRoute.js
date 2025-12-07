const express = require("express");
const announcementRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    getAllAnnouncementsController,
    getAnnouncementController,
    createAnnouncementController,
    updateAnnouncementController,
    deleteAnnouncementController,
} = require("../controllers/announcementController");

// Public routes
announcementRouter.get("/", getAllAnnouncementsController);
announcementRouter.get("/:id", getAnnouncementController);

// Warden/Admin routes
announcementRouter.post("/", authenticate, authorizeRoles("WARDEN", "ADMIN"), createAnnouncementController);
announcementRouter.put("/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateAnnouncementController);
announcementRouter.delete("/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), deleteAnnouncementController);

module.exports = announcementRouter;

const express = require("express");
const issueRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    createIssueController,
    getMyIssuesController,
    getAllIssuesController,
    getIssueController,
    updateIssueStatusController,
    resolveIssueController,
} = require("../controllers/issueController");

// Student routes
issueRouter.post("/", authenticate, authorizeRoles("STUDENT"), createIssueController);
issueRouter.get("/my-issues", authenticate, authorizeRoles("STUDENT"), getMyIssuesController);
issueRouter.get("/:id", authenticate, getIssueController); // Both student and warden

// Warden routes
issueRouter.get("/", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAllIssuesController);
issueRouter.put("/:id/status", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateIssueStatusController);
issueRouter.put("/:id/resolve", authenticate, authorizeRoles("WARDEN", "ADMIN"), resolveIssueController);

module.exports = issueRouter;

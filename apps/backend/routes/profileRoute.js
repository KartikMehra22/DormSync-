const express = require("express");
const profileRouter = express.Router();
const { authenticate } = require("../utils/auth");
const {
    getProfileController,
    updateProfileController,
} = require("../controllers/profileController");

// All profile routes require authentication
profileRouter.get("/me", authenticate, getProfileController);
profileRouter.put("/update", authenticate, updateProfileController);

module.exports = profileRouter;

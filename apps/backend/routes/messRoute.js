const express = require("express");
const messRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    getMessMenuController,
    createOrUpdateMenuController,
    deleteMenuController,
} = require("../controllers/messMenuController");

const {
    optOutOfMealController,
    cancelOptOutController,
    getMyOptOutsController,
    getAllOptOutsController,
    getMyCreditsController,
} = require("../controllers/messOptOutController");

// Menu routes
messRouter.get("/menu", getMessMenuController); // Public
messRouter.post("/menu", authenticate, authorizeRoles("WARDEN", "ADMIN"), createOrUpdateMenuController);
messRouter.delete("/menu/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), deleteMenuController);

// Opt-out routes (Student)
messRouter.post("/opt-out", authenticate, authorizeRoles("STUDENT"), optOutOfMealController);
messRouter.delete("/opt-out/:id", authenticate, authorizeRoles("STUDENT"), cancelOptOutController);
messRouter.get("/my-opt-outs", authenticate, authorizeRoles("STUDENT"), getMyOptOutsController);
messRouter.get("/credits", authenticate, authorizeRoles("STUDENT"), getMyCreditsController);

// Opt-out routes (Warden)
messRouter.get("/opt-outs", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAllOptOutsController);

module.exports = messRouter;

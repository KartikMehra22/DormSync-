const express = require("express");
const messSuggestionRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    createSuggestionController,
    getAllSuggestionsController,
    voteSuggestionController,
    updateSuggestionStatusController,
    deleteSuggestionController,
} = require("../controllers/messSuggestionController");

// Student routes
messSuggestionRouter.post("/", authenticate, authorizeRoles("STUDENT"), createSuggestionController);
messSuggestionRouter.post("/:id/vote", authenticate, authorizeRoles("STUDENT"), voteSuggestionController);

// Public/All users
messSuggestionRouter.get("/", authenticate, getAllSuggestionsController);

// Warden routes
messSuggestionRouter.put("/:id/status", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateSuggestionStatusController);

// Delete (own or warden)
messSuggestionRouter.delete("/:id", authenticate, deleteSuggestionController);

module.exports = messSuggestionRouter;

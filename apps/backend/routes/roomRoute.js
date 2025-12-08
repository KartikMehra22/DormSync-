const express = require("express");
const roomRouter = express.Router();
const { authenticate } = require("../utils/auth");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const {
    getAllBlocksController,
    createBlockController,
    updateBlockController,
    deleteBlockController,
} = require("../controllers/blockController");

const {
    getAllRoomsController,
    getRoomController,
    createRoomController,
    updateRoomController,
    deleteRoomController,
    createBulkRoomsController,
} = require("../controllers/roomController");

const {
    getMyRoomController,
    getAllAllocationsController,
    allocateRoomController,
    vacateRoomController,
} = require("../controllers/roomAllocationController");

const {
    getMyRequestsController,
    createRoomRequestController,
    getAllRequestsController,
    approveRequestController,
    rejectRequestController,
} = require("../controllers/roomRequestController");

// Block routes
roomRouter.get("/blocks", getAllBlocksController);
roomRouter.post("/blocks", authenticate, authorizeRoles("WARDEN", "ADMIN"), createBlockController);
roomRouter.put("/blocks/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateBlockController);
roomRouter.delete("/blocks/:id", authenticate, authorizeRoles("ADMIN"), deleteBlockController);

// Bulk Room Creation
roomRouter.post("/blocks/bulk-rooms", authenticate, authorizeRoles("WARDEN", "ADMIN"), createBulkRoomsController);

// Room routes
roomRouter.get("/rooms", getAllRoomsController);
roomRouter.get("/rooms/:id", getRoomController);
roomRouter.post("/rooms", authenticate, authorizeRoles("WARDEN", "ADMIN"), createRoomController);
roomRouter.put("/rooms/:id", authenticate, authorizeRoles("WARDEN", "ADMIN"), updateRoomController);
roomRouter.delete("/rooms/:id", authenticate, authorizeRoles("ADMIN"), deleteRoomController);

// Room allocation routes
roomRouter.get("/allocations/my-room", authenticate, authorizeRoles("STUDENT"), getMyRoomController);
roomRouter.get("/allocations", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAllAllocationsController);
roomRouter.post("/allocations", authenticate, authorizeRoles("WARDEN", "ADMIN"), allocateRoomController);
roomRouter.put("/allocations/:id/vacate", authenticate, authorizeRoles("WARDEN", "ADMIN"), vacateRoomController);

// Room request routes
roomRouter.get("/requests/my-requests", authenticate, authorizeRoles("STUDENT"), getMyRequestsController);
roomRouter.post("/requests", authenticate, authorizeRoles("STUDENT"), createRoomRequestController);
roomRouter.get("/requests", authenticate, authorizeRoles("WARDEN", "ADMIN"), getAllRequestsController);
roomRouter.put("/requests/:id/approve", authenticate, authorizeRoles("WARDEN", "ADMIN"), approveRequestController);
roomRouter.put("/requests/:id/reject", authenticate, authorizeRoles("WARDEN", "ADMIN"), rejectRequestController);

module.exports = roomRouter;

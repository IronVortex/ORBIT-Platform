const express = require("express");
const prController = require("../controllers/pullRequestController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { requireOwner, requireReadAccess } = require("../middleware/ownershipMiddleware");

const prRouter = express.Router();

// Read: open to public repos
prRouter.get("/repo/:id/pulls", optionalAuth, requireReadAccess, prController.getAllPRs);
prRouter.get("/repo/:id/pulls/:prId", optionalAuth, requireReadAccess, prController.getPRById);
prRouter.get("/repo/:id/pulls/:prId/diff", optionalAuth, requireReadAccess, prController.getPRDiff);

// Write: auth required
prRouter.post("/repo/:id/pulls", authenticate, requireReadAccess, prController.createPR);
prRouter.patch("/repo/:id/pulls/:prId", authenticate, requireReadAccess, prController.updatePR);
prRouter.post("/repo/:id/pulls/:prId/comments", authenticate, requireReadAccess, prController.addPRComment);
prRouter.post("/repo/:id/pulls/:prId/review", authenticate, requireReadAccess, prController.submitReview);

// Merge: owner only
prRouter.post("/repo/:id/pulls/:prId/merge", authenticate, requireOwner, prController.mergePR);

module.exports = prRouter;

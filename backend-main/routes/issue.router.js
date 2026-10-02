const express = require("express");
const issueController = require("../controllers/issueController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { requireOwner, requireReadAccess } = require("../middleware/ownershipMiddleware");

const issueRouter = express.Router();

// Read: public repos accessible without auth
issueRouter.get("/repo/:id/issues", optionalAuth, requireReadAccess, issueController.getAllIssues);
issueRouter.get("/repo/:id/issues/:issueId", optionalAuth, requireReadAccess, issueController.getIssueById);

// Write: requires auth
issueRouter.post("/repo/:id/issues", authenticate, requireReadAccess, issueController.createIssue);
issueRouter.patch("/repo/:id/issues/:issueId", authenticate, requireReadAccess, issueController.updateIssueById);
issueRouter.post("/repo/:id/issues/:issueId/comments", authenticate, requireReadAccess, issueController.addComment);

// Delete: owner only
issueRouter.delete("/repo/:id/issues/:issueId", authenticate, requireOwner, issueController.deleteIssueById);

module.exports = issueRouter;

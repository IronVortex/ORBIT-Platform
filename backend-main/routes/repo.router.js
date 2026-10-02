const express = require("express");
const repoController = require("../controllers/repoController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { requireOwner, requireReadAccess } = require("../middleware/ownershipMiddleware");

const repoRouter = express.Router();

// Public reads
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/:id", optionalAuth, requireReadAccess, repoController.fetchRepositoryById);

// Authenticated writes
repoRouter.post("/repo/create", authenticate, repoController.createRepository);
repoRouter.put("/repo/update/:id", authenticate, requireOwner, repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticate, requireOwner, repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", authenticate, requireOwner, repoController.deleteRepositoryById);

module.exports = repoRouter;

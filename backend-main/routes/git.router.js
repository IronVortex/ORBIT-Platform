const express = require("express");
const gitController = require("../controllers/gitController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { requireOwner, requireReadAccess } = require("../middleware/ownershipMiddleware");

const gitRouter = express.Router();

// All git read routes: require read access (public repos open, private require auth+ownership)
gitRouter.get("/repo/:id/status", optionalAuth, requireReadAccess, gitController.getRepoStatus);
gitRouter.get("/repo/:id/branches", optionalAuth, requireReadAccess, gitController.getBranches);
gitRouter.get("/repo/:id/commits/:branch", optionalAuth, requireReadAccess, gitController.getCommits);
gitRouter.get("/repo/:id/commits/:branch/:hash", optionalAuth, requireReadAccess, gitController.getCommitDetail);
gitRouter.get("/repo/:id/tree/:branch", optionalAuth, requireReadAccess, gitController.getTree);
gitRouter.get("/repo/:id/tree/:branch/*", optionalAuth, requireReadAccess, gitController.getTree);
gitRouter.get("/repo/:id/blob/:branch/*", optionalAuth, requireReadAccess, gitController.getBlob);
gitRouter.get("/repo/:id/readme/:branch", optionalAuth, requireReadAccess, gitController.getReadme);
gitRouter.get("/repo/:id/diff/:base/:head", optionalAuth, requireReadAccess, gitController.getDiff);

// Write routes: require auth + ownership
gitRouter.post("/repo/:id/branches", authenticate, requireOwner, gitController.postBranch);
gitRouter.delete("/repo/:id/branches/:branch", authenticate, requireOwner, gitController.deleteBranch);

module.exports = gitRouter;

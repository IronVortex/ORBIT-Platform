const Repository = require("../models/repoModel");
const mongoose = require("mongoose");

/**
 * Verifies the authenticated user is the owner of :id repository.
 * Must be used AFTER authenticate middleware.
 */
async function requireOwner(req, res, next) {
  const repoId = req.params.id || req.params.repoId;
  if (!mongoose.Types.ObjectId.isValid(repoId)) {
    return res.status(400).json({ error: "Invalid repository ID." });
  }
  try {
    const repo = await Repository.findById(repoId).select("owner visibility");
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    if (repo.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Forbidden: you do not own this repository." });
    }
    req.repo = repo;
    next();
  } catch (err) {
    console.error("Ownership check error:", err);
    res.status(500).json({ error: "Server error." });
  }
}

/**
 * Allows access if: repo is public, OR user is the owner.
 * Must be used AFTER optionalAuth middleware.
 */
async function requireReadAccess(req, res, next) {
  const repoId = req.params.id || req.params.repoId;
  if (!mongoose.Types.ObjectId.isValid(repoId)) {
    return res.status(400).json({ error: "Invalid repository ID." });
  }
  try {
    const repo = await Repository.findById(repoId).select("owner visibility");
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    const isPublic = repo.visibility === true || repo.visibility == null;
    const isOwner = req.user && repo.owner.toString() === req.user.id.toString();
    if (!isPublic && !isOwner) {
      return res.status(403).json({ error: "Forbidden: this repository is private." });
    }
    req.repo = repo;
    next();
  } catch (err) {
    console.error("Read access check error:", err);
    res.status(500).json({ error: "Server error." });
  }
}

module.exports = { requireOwner, requireReadAccess };

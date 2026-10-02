const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const gitService = require("../services/gitService");

async function createRepository(req, res) {
  const { name, description, visibility, language } = req.body;
  const owner = req.user.id; // from JWT

  try {
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Repository name is required." });
    }

    const normalizedName = String(name).trim();

    // Validate name: alphanumeric, hyphens, underscores, dots
    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedName)) {
      return res.status(400).json({ error: "Repository name contains invalid characters." });
    }

    const existing = await Repository.findOne({
      owner,
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ error: "A repository with this name already exists." });
    }

    const newRepository = new Repository({
      name: normalizedName,
      description,
      visibility: visibility !== false,
      language,
      owner,
      content: [],
      issues: [],
      gitInitialized: false,
    });

    const result = await newRepository.save();

    // Initialize the bare Git repo
    try {
      await gitService.initBareRepo(result._id.toString());
      result.gitInitialized = true;
      await result.save();
    } catch (gitErr) {
      console.error("Git init error (non-fatal):", gitErr.message);
    }

    res.status(201).json({
      message: "Repository created!",
      repositoryId: result._id,
      repository: result,
    });
  } catch (err) {
    console.error("createRepository error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repos = await Repository.find({ visibility: true })
      .populate("owner", "username email")
      .sort({ updatedAt: -1 });
    res.json(repos);
  } catch (err) {
    console.error("getAllRepositories error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findById(id)
      .populate("owner", "username email")
      .populate("issues");
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    res.json(repo);
  } catch (err) {
    console.error("fetchRepositoryById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repos = await Repository.find({ name })
      .populate("owner", "username email")
      .populate("issues");
    res.json(repos);
  } catch (err) {
    console.error("fetchRepositoryByName error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;
  try {
    const repos = await Repository.find({ owner: userID }).sort({ updatedAt: -1 });
    res.json({ message: "Repositories found.", repositories: repos });
  } catch (err) {
    console.error("fetchRepositoriesForCurrentUser error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { description, language, defaultBranch } = req.body;

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    if (description !== undefined) repo.description = description;
    if (language !== undefined) repo.language = language;
    if (defaultBranch !== undefined) repo.defaultBranch = defaultBranch;

    const updated = await repo.save();
    res.json({ message: "Repository updated.", repository: updated });
  } catch (err) {
    console.error("updateRepositoryById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    repo.visibility = !repo.visibility;
    const updated = await repo.save();
    res.json({ message: "Visibility updated.", repository: updated });
  } catch (err) {
    console.error("toggleVisibilityById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findByIdAndDelete(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    res.json({ message: "Repository deleted." });
  } catch (err) {
    console.error("deleteRepositoryById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};

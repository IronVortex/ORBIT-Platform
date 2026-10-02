const gitService = require("../services/gitService");
const Repository = require("../models/repoModel");
const mongoose = require("mongoose");

function validateRepoId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /repo/:id/branches
 */
async function getBranches(req, res) {
  try {
    const { branches, defaultBranch } = await gitService.listBranches(req.params.id);
    res.json({ branches, defaultBranch });
  } catch (err) {
    console.error("getBranches error:", err);
    res.status(500).json({ error: "Failed to list branches." });
  }
}

/**
 * POST /repo/:id/branches
 * Body: { name, from }
 */
async function postBranch(req, res) {
  const { name, from } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Branch name is required." });
  }
  const fromBranch = from || "main";
  try {
    const hasCommits = await gitService.repoHasCommits(req.params.id);
    if (!hasCommits) {
      return res.status(400).json({ error: "Repository has no commits yet. Push at least one commit first." });
    }
    const result = await gitService.createBranch(req.params.id, name, fromBranch);
    res.status(201).json(result);
  } catch (err) {
    console.error("postBranch error:", err);
    res.status(500).json({ error: err.message || "Failed to create branch." });
  }
}

/**
 * DELETE /repo/:id/branches/:branch
 */
async function deleteBranch(req, res) {
  const { branch } = req.params;
  try {
    const defaultBranch = await gitService.getDefaultBranch(req.params.id);
    if (branch === defaultBranch) {
      return res.status(400).json({ error: "Cannot delete the default branch." });
    }
    const result = await gitService.deleteBranch(req.params.id, branch, defaultBranch);
    res.json(result);
  } catch (err) {
    console.error("deleteBranch error:", err);
    res.status(500).json({ error: err.message || "Failed to delete branch." });
  }
}

/**
 * GET /repo/:id/commits/:branch
 */
async function getCommits(req, res) {
  const { branch } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  try {
    const commits = await gitService.getCommits(req.params.id, branch, limit);
    res.json({ commits, branch });
  } catch (err) {
    console.error("getCommits error:", err);
    res.status(500).json({ error: "Failed to fetch commits." });
  }
}

/**
 * GET /repo/:id/commits/:branch/:hash
 */
async function getCommitDetail(req, res) {
  const { hash } = req.params;
  if (!/^[a-f0-9]{4,40}$/.test(hash)) {
    return res.status(400).json({ error: "Invalid commit hash." });
  }
  try {
    const detail = await gitService.getCommitDetail(req.params.id, hash);
    if (!detail) return res.status(404).json({ error: "Commit not found." });
    const diff = await gitService.getCommitDiff(req.params.id, hash);
    res.json({ ...detail, diff });
  } catch (err) {
    console.error("getCommitDetail error:", err);
    res.status(500).json({ error: "Failed to fetch commit." });
  }
}

/**
 * GET /repo/:id/tree/:branch
 * GET /repo/:id/tree/:branch/*path
 */
async function getTree(req, res) {
  const { branch } = req.params;
  const dirPath = req.params[0] || "";
  try {
    const tree = await gitService.getFileTree(req.params.id, branch, dirPath);
    const latestCommit = await gitService.getLatestCommit(req.params.id, branch);
    res.json({ tree, branch, path: dirPath, latestCommit });
  } catch (err) {
    console.error("getTree error:", err);
    res.status(500).json({ error: "Failed to fetch file tree." });
  }
}

/**
 * GET /repo/:id/blob/:branch/*path
 */
async function getBlob(req, res) {
  const { branch } = req.params;
  const filePath = req.params[0] || "";
  if (!filePath) {
    return res.status(400).json({ error: "File path is required." });
  }
  try {
    const content = await gitService.getFileContent(req.params.id, branch, filePath);
    if (content === null) {
      return res.status(404).json({ error: "File not found." });
    }
    // Detect binary by checking for null bytes
    const isBinary = content.includes("\0");
    res.json({
      path: filePath,
      branch,
      content: isBinary ? null : content,
      isBinary,
      size: Buffer.byteLength(content, "utf8"),
    });
  } catch (err) {
    console.error("getBlob error:", err);
    res.status(500).json({ error: "Failed to fetch file." });
  }
}

/**
 * GET /repo/:id/readme/:branch
 */
async function getReadme(req, res) {
  const { branch } = req.params;
  const readmeCandidates = ["README.md", "readme.md", "Readme.md", "README.txt", "README"];
  try {
    for (const name of readmeCandidates) {
      const content = await gitService.getFileContent(req.params.id, branch, name);
      if (content !== null) {
        return res.json({ name, content, exists: true });
      }
    }
    return res.json({ exists: false, content: null });
  } catch (err) {
    console.error("getReadme error:", err);
    res.status(500).json({ error: "Failed to fetch README." });
  }
}

/**
 * GET /repo/:id/diff/:base/:head
 */
async function getDiff(req, res) {
  const { base, head } = req.params;
  try {
    const diff = await gitService.getDiffBetweenBranches(req.params.id, base, head);
    const commits = await gitService.getCommitsBetweenBranches(req.params.id, base, head);
    res.json({ diff, commits, base, head });
  } catch (err) {
    console.error("getDiff error:", err);
    res.status(500).json({ error: "Failed to get diff." });
  }
}

/**
 * GET /repo/:id/status
 * Returns basic repo info: has commits, branches, latest commit
 */
async function getRepoStatus(req, res) {
  try {
    const hasCommits = await gitService.repoHasCommits(req.params.id);
    if (!hasCommits) {
      const cloneInfo = gitService.getCloneInfo(req.params.id);
      return res.json({ hasCommits: false, cloneInfo });
    }
    const { branches, defaultBranch } = await gitService.listBranches(req.params.id);
    const latestCommit = await gitService.getLatestCommit(req.params.id, defaultBranch);
    const cloneInfo = gitService.getCloneInfo(req.params.id);
    res.json({ hasCommits: true, branches, defaultBranch, latestCommit, cloneInfo });
  } catch (err) {
    console.error("getRepoStatus error:", err);
    res.status(500).json({ error: "Failed to fetch repo status." });
  }
}

module.exports = {
  getBranches,
  postBranch,
  deleteBranch,
  getCommits,
  getCommitDetail,
  getTree,
  getBlob,
  getReadme,
  getDiff,
  getRepoStatus,
};

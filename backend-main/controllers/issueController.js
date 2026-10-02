const mongoose = require("mongoose");
const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");

/**
 * GET /repo/:id/issues
 * List issues for a repository. Filter by ?status=open|closed
 */
async function getAllIssues(req, res) {
  const repoId = req.params.id;
  const { status, label } = req.query;

  try {
    const filter = { repository: repoId };
    if (status && ["open", "closed"].includes(status)) filter.status = status;
    if (label) filter.labels = label;

    const issues = await Issue.find(filter)
      .populate("author", "username")
      .populate("assignee", "username")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    console.error("getAllIssues error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /repo/:id/issues/:issueId
 */
async function getIssueById(req, res) {
  const { issueId } = req.params;
  try {
    const issue = await Issue.findById(issueId)
      .populate("author", "username")
      .populate("assignee", "username")
      .populate("comments.author", "username");
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    res.json(issue);
  } catch (err) {
    console.error("getIssueById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/issues
 */
async function createIssue(req, res) {
  const repoId = req.params.id;
  const { title, description, labels, assignee } = req.body;
  const author = req.user.id;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    // Get next issue number
    const lastIssue = await Issue.findOne({ repository: repoId })
      .sort({ number: -1 })
      .select("number");
    const number = (lastIssue?.number || 0) + 1;

    const issue = new Issue({
      number,
      title,
      description,
      labels: Array.isArray(labels) ? labels : [],
      assignee: assignee || undefined,
      author,
      repository: repoId,
    });

    await issue.save();
    const populated = await issue.populate("author", "username");
    res.status(201).json(populated);
  } catch (err) {
    console.error("createIssue error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * PATCH /repo/:id/issues/:issueId
 * Update title, description, status, labels, assignee
 */
async function updateIssueById(req, res) {
  const { issueId } = req.params;
  const { title, description, status, labels, assignee } = req.body;

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    // Only author or repo owner can update
    const isAuthor = issue.author && issue.author.toString() === req.user.id;
    const isOwner = req.repo && req.repo.owner.toString() === req.user.id;
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ error: "Forbidden." });
    }

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined && ["open", "closed"].includes(status)) {
      issue.status = status;
      if (status === "closed" && !issue.closedAt) issue.closedAt = new Date();
      if (status === "open") issue.closedAt = undefined;
    }
    if (labels !== undefined) issue.labels = labels;
    if (assignee !== undefined) issue.assignee = assignee || undefined;

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error("updateIssueById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/issues/:issueId/comments
 */
async function addComment(req, res) {
  const { issueId } = req.params;
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Comment body is required." });
  }

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    issue.comments.push({ author: req.user.id, body });
    await issue.save();
    const populated = await issue.populate("comments.author", "username");
    res.status(201).json(populated.comments[populated.comments.length - 1]);
  } catch (err) {
    console.error("addComment error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * DELETE /repo/:id/issues/:issueId
 */
async function deleteIssueById(req, res) {
  const { issueId } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    res.json({ message: "Issue deleted." });
  } catch (err) {
    console.error("deleteIssueById error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssueById,
  addComment,
  deleteIssueById,
};

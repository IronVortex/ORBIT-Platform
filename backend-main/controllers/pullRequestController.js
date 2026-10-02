const PullRequest = require("../models/pullRequestModel");
const gitService = require("../services/gitService");

/**
 * GET /repo/:id/pulls
 */
async function getAllPRs(req, res) {
  const repoId = req.params.id;
  const { status } = req.query;
  try {
    const filter = { repository: repoId };
    if (status && ["open", "merged", "closed"].includes(status)) filter.status = status;
    const prs = await PullRequest.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(prs);
  } catch (err) {
    console.error("getAllPRs error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /repo/:id/pulls/:prId
 */
async function getPRById(req, res) {
  const { prId } = req.params;
  try {
    const pr = await PullRequest.findById(prId)
      .populate("author", "username")
      .populate("reviewers", "username")
      .populate("reviews.reviewer", "username")
      .populate("comments.author", "username");
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    res.json(pr);
  } catch (err) {
    console.error("getPRById error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/pulls
 */
async function createPR(req, res) {
  const repoId = req.params.id;
  const { title, description, sourceBranch, targetBranch } = req.body;
  const author = req.user.id;

  if (!title || !sourceBranch || !targetBranch) {
    return res.status(400).json({ error: "title, sourceBranch and targetBranch are required." });
  }
  if (sourceBranch === targetBranch) {
    return res.status(400).json({ error: "Source and target branches must differ." });
  }

  try {
    const hasCommits = await gitService.repoHasCommits(repoId);
    if (!hasCommits) {
      return res.status(400).json({ error: "Repository has no commits yet." });
    }

    const lastPR = await PullRequest.findOne({ repository: repoId })
      .sort({ number: -1 })
      .select("number");
    const number = (lastPR?.number || 0) + 1;

    const pr = new PullRequest({
      number,
      title,
      description: description || "",
      repository: repoId,
      sourceBranch,
      targetBranch,
      author,
    });

    await pr.save();
    const populated = await pr.populate("author", "username");
    res.status(201).json(populated);
  } catch (err) {
    console.error("createPR error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * PATCH /repo/:id/pulls/:prId — update title/description/status
 */
async function updatePR(req, res) {
  const { prId } = req.params;
  const { title, description, status } = req.body;
  try {
    const pr = await PullRequest.findById(prId);
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    if (pr.status !== "open") {
      return res.status(400).json({ error: "Cannot modify a closed or merged pull request." });
    }
    const isAuthor = pr.author.toString() === req.user.id;
    const isOwner = req.repo && req.repo.owner.toString() === req.user.id;
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ error: "Forbidden." });
    }
    if (title !== undefined) pr.title = title;
    if (description !== undefined) pr.description = description;
    if (status === "closed") { pr.status = "closed"; pr.closedAt = new Date(); }
    await pr.save();
    res.json(pr);
  } catch (err) {
    console.error("updatePR error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/pulls/:prId/merge
 * Only repo owner can merge.
 */
async function mergePR(req, res) {
  const { prId } = req.params;
  const repoId = req.params.id;
  try {
    const pr = await PullRequest.findById(prId);
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    if (pr.status !== "open") {
      return res.status(400).json({ error: "Pull request is not open." });
    }

    // Check that the repo owner is requesting
    if (!req.repo || req.repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only the repository owner can merge." });
    }

    const hasCommits = await gitService.repoHasCommits(repoId);
    if (!hasCommits) {
      return res.status(400).json({ error: "Repository has no commits." });
    }

    pr.status = "merged";
    pr.mergedAt = new Date();
    await pr.save();

    res.json({ message: "Pull request merged.", pr });
  } catch (err) {
    console.error("mergePR error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/pulls/:prId/review
 */
async function submitReview(req, res) {
  const { prId } = req.params;
  const { state, body } = req.body;
  if (!state || !["approved", "changes_requested", "commented"].includes(state)) {
    return res.status(400).json({ error: "state must be approved, changes_requested, or commented." });
  }
  try {
    const pr = await PullRequest.findById(prId);
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    if (pr.status !== "open") {
      return res.status(400).json({ error: "Cannot review a closed pull request." });
    }
    pr.reviews.push({ reviewer: req.user.id, state, body: body || "" });
    await pr.save();
    res.status(201).json({ message: "Review submitted.", reviews: pr.reviews });
  } catch (err) {
    console.error("submitReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /repo/:id/pulls/:prId/comments
 */
async function addPRComment(req, res) {
  const { prId } = req.params;
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: "Comment body is required." });
  }
  try {
    const pr = await PullRequest.findById(prId);
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    pr.comments.push({ author: req.user.id, body });
    await pr.save();
    const populated = await pr.populate("comments.author", "username");
    const newComment = populated.comments[populated.comments.length - 1];
    res.status(201).json(newComment);
  } catch (err) {
    console.error("addPRComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /repo/:id/pulls/:prId/diff
 */
async function getPRDiff(req, res) {
  const { prId } = req.params;
  const repoId = req.params.id;
  try {
    const pr = await PullRequest.findById(prId);
    if (!pr) return res.status(404).json({ error: "Pull request not found." });
    const hasCommits = await gitService.repoHasCommits(repoId);
    if (!hasCommits) return res.json({ diff: "", commits: [] });
    const [diff, commits] = await Promise.all([
      gitService.getDiffBetweenBranches(repoId, pr.targetBranch, pr.sourceBranch),
      gitService.getCommitsBetweenBranches(repoId, pr.targetBranch, pr.sourceBranch),
    ]);
    res.json({ diff, commits, sourceBranch: pr.sourceBranch, targetBranch: pr.targetBranch });
  } catch (err) {
    console.error("getPRDiff error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllPRs,
  getPRById,
  createPR,
  updatePR,
  mergePR,
  submitReview,
  addPRComment,
  getPRDiff,
};

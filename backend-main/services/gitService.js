const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const GIT_REPOS_ROOT = path.resolve(__dirname, "../git-repos");

// Ensure git-repos directory exists
if (!fs.existsSync(GIT_REPOS_ROOT)) {
  fs.mkdirSync(GIT_REPOS_ROOT, { recursive: true });
}

function repoPath(repoId) {
  // Sanitize repoId: only allow alphanumeric and hyphen/underscore
  const safe = String(repoId).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) throw new Error("Invalid repository ID");
  return path.join(GIT_REPOS_ROOT, `${safe}.git`);
}

function getGit(repoId) {
  const rp = repoPath(repoId);
  return simpleGit(rp);
}

async function initBareRepo(repoId) {
  const rp = repoPath(repoId);
  if (fs.existsSync(rp)) {
    return { alreadyExists: true, path: rp };
  }
  await fsp.mkdir(rp, { recursive: true });
  const git = simpleGit();
  await git.init(["--bare", rp]);
  return { alreadyExists: false, path: rp };
}

async function repoIsInitialized(repoId) {
  const rp = repoPath(repoId);
  if (!fs.existsSync(rp)) return false;
  try {
    const git = getGit(repoId);
    const result = await git.raw(["rev-parse", "--is-bare-repository"]);
    return result.trim() === "true";
  } catch {
    return false;
  }
}

async function repoHasCommits(repoId) {
  try {
    const git = getGit(repoId);
    await git.raw(["rev-parse", "HEAD"]);
    return true;
  } catch {
    return false;
  }
}
async function listBranches(repoId) {
  const git = getGit(repoId);
  const hasCommits = await repoHasCommits(repoId);
  if (!hasCommits) return { branches: [], defaultBranch: null };
  try {
    const result = await git.branch(["-a", "--format=%(refname:short)"]);
    const branches = result.all.filter(
      (b) => !b.startsWith("origin/HEAD")
    );
    // Get default branch (HEAD)
    let defaultBranch = "main";
    try {
      const headRef = await git.raw(["symbolic-ref", "--short", "HEAD"]);
      defaultBranch = headRef.trim();
    } catch {
      try {
        const branches2 = await git.branch(["--format=%(refname:short)"]);
        defaultBranch = branches2.current || (branches2.all[0] || "main");
      } catch {
        defaultBranch = "main";
      }
    }
    return { branches, defaultBranch };
  } catch (err) {
    console.error("listBranches error:", err.message);
    return { branches: [], defaultBranch: null };
  }
}

/**
 * Get the default branch name.
 */
async function getDefaultBranch(repoId) {
  const { defaultBranch } = await listBranches(repoId);
  return defaultBranch;
}

/**
 * Get commit log for a branch.
 */
async function getCommits(repoId, branch = "main", limit = 30) {
  const git = getGit(repoId);
  const hasCommits = await repoHasCommits(repoId);
  if (!hasCommits) return [];
  try {
    const log = await git.log({
      from: undefined,
      to: branch,
      maxCount: limit,
      "--format": "%H|%an|%ae|%aI|%s",
    });
    return log.all.map((c) => ({
      hash: c.hash,
      shortHash: c.hash.substring(0, 7),
      message: c.message,
      author: c.author_name,
      authorEmail: c.author_email,
      date: c.date,
    }));
  } catch (err) {
    console.error("getCommits error:", err.message);
    return [];
  }
}

async function getCommitDetail(repoId, hash) {
  const git = getGit(repoId);
  try {
    const [show, diffStat] = await Promise.all([
      git.raw(["show", "--quiet", "--format=%H|%an|%ae|%aI|%s|%b", hash]),
      git.raw(["diff-tree", "--no-commit-id", "-r", "--stat", hash]),
    ]);
    const lines = show.trim().split("\n");
    const [h, author, authorEmail, date, subject, ...bodyParts] = lines[0].split("|");
    return {
      hash: h,
      shortHash: h.substring(0, 7),
      author,
      authorEmail,
      date,
      message: subject,
      body: bodyParts.join("|"),
      diffStat: diffStat.trim(),
    };
  } catch (err) {
    console.error("getCommitDetail error:", err.message);
    return null;
  }
}


async function getCommitDiff(repoId, hash) {
  const git = getGit(repoId);
  try {
    const diff = await git.raw(["show", "--format=", "-p", "--unified=5", hash]);
    return diff;
  } catch (err) {
    console.error("getCommitDiff error:", err.message);
    return "";
  }
}

async function getFileTree(repoId, branch = "main", dirPath = "") {
  const git = getGit(repoId);
  const hasCommits = await repoHasCommits(repoId);
  if (!hasCommits) return [];
  try {
    const prefix = dirPath ? `${dirPath}/` : "";
    const result = await git.raw([
      "ls-tree",
      "--format=%(objecttype)|%(objectsize)|%(path)",
      `${branch}:${dirPath}`,
    ]);
    const items = result
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [type, size, ...pathParts] = line.split("|");
        const name = pathParts.join("|");
        return {
          name,
          path: dirPath ? `${dirPath}/${name}` : name,
          type: type === "tree" ? "directory" : "file",
          size: type === "blob" ? parseInt(size, 10) : null,
        };
      });
    
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return items;
  } catch (err) {
    console.error("getFileTree error:", err.message);
    return [];
  }
}

async function getFileContent(repoId, branch = "main", filePath) {
  const git = getGit(repoId);
  try {
    const content = await git.raw(["show", `${branch}:${filePath}`]);
    return content;
  } catch (err) {
    console.error("getFileContent error:", err.message);
    return null;
  }
}

/**
 * Get the diff between two branches.
 */
async function getDiffBetweenBranches(repoId, baseBranch, headBranch) {
  const git = getGit(repoId);
  try {
    const diff = await git.raw([
      "diff",
      "--unified=5",
      `${baseBranch}...${headBranch}`,
    ]);
    return diff;
  } catch (err) {
    console.error("getDiffBetweenBranches error:", err.message);
    return "";
  }
}

/**
 * Get commits that are in headBranch but not baseBranch.
 */
async function getCommitsBetweenBranches(repoId, baseBranch, headBranch) {
  const git = getGit(repoId);
  try {
    const log = await git.log({
      from: baseBranch,
      to: headBranch,
      maxCount: 100,
    });
    return log.all.map((c) => ({
      hash: c.hash,
      shortHash: c.hash.substring(0, 7),
      message: c.message,
      author: c.author_name,
      authorEmail: c.author_email,
      date: c.date,
    }));
  } catch (err) {
    console.error("getCommitsBetweenBranches error:", err.message);
    return [];
  }
}

/**
 * Create a new branch from an existing one.
 */
async function createBranch(repoId, branchName, fromBranch = "main") {
  // Validate branch name
  if (!/^[a-zA-Z0-9._/-]+$/.test(branchName)) {
    throw new Error("Invalid branch name.");
  }
  const git = getGit(repoId);
  try {
    await git.raw(["branch", branchName, fromBranch]);
    return { created: true, branch: branchName };
  } catch (err) {
    console.error("createBranch error:", err.message);
    throw err;
  }
}

/**
 * Delete a branch (must not be the default branch).
 */
async function deleteBranch(repoId, branchName, defaultBranch) {
  if (branchName === defaultBranch) {
    throw new Error("Cannot delete the default branch.");
  }
  if (!/^[a-zA-Z0-9._/-]+$/.test(branchName)) {
    throw new Error("Invalid branch name.");
  }
  const git = getGit(repoId);
  try {
    await git.raw(["branch", "-D", branchName]);
    return { deleted: true };
  } catch (err) {
    console.error("deleteBranch error:", err.message);
    throw err;
  }
}

/**
 * Get the latest commit on a branch.
 */
async function getLatestCommit(repoId, branch = "main") {
  const commits = await getCommits(repoId, branch, 1);
  return commits[0] || null;
}

/**
 * Get the clone URL for the repo (SSH style using path).
 * In a production system this would be a real SSH/HTTPS URL.
 */
function getCloneInfo(repoId) {
  return {
    httpUrl: `http://localhost:3000/git/${repoId}.git`,
    path: repoPath(repoId),
  };
}

module.exports = {
  initBareRepo,
  repoIsInitialized,
  repoHasCommits,
  listBranches,
  getDefaultBranch,
  getCommits,
  getCommitDetail,
  getCommitDiff,
  getFileTree,
  getFileContent,
  getDiffBetweenBranches,
  getCommitsBetweenBranches,
  createBranch,
  deleteBranch,
  getLatestCommit,
  getCloneInfo,
  repoPath,
};

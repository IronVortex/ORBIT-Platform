import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FolderGit2, GitBranch, Clock, FileText, Code, CircleDot,
  GitPullRequest, Settings, Eye, GitFork, Star, ChevronDown,
  ChevronRight, File, Folder, ArrowLeft, Copy, Check,
  AlertCircle, RefreshCw, Terminal
} from "lucide-react";
import { getRepoById } from "../../api/repoApi";
import { getRepoStatus, getBranches, getTree, getReadme, getCommits } from "../../api/gitApi";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import "./RepositoryDetail.css";

/* ── helpers ──────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="orbit-copy-btn" title="Copy">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/* ── README renderer (plain text / markdown-lite) ─────── */
function ReadmeBlock({ content, name }) {
  if (!content) return null;
  // Simple: render pre-formatted. A real markdown renderer could be added later.
  return (
    <div className="orbit-readme">
      <div className="orbit-readme-header">
        <FileText size={16} /> {name || "README.md"}
      </div>
      <div className="orbit-readme-body">
        <pre>{content}</pre>
      </div>
    </div>
  );
}

/* ── file tree row ─────────────────────────────────────── */
function TreeRow({ item, repoId, branch, onNavigate }) {
  const isDir = item.type === "directory";
  return (
    <div
      className={`orbit-tree-row ${isDir ? "is-dir" : ""}`}
      onClick={() => isDir && onNavigate(item.path)}
    >
      <span className="orbit-tree-icon">
        {isDir ? <Folder size={15} /> : <File size={15} />}
      </span>
      {isDir ? (
        <span className="orbit-tree-name">{item.name}</span>
      ) : (
        <Link
          to={`/repo/${repoId}/blob/${branch}/${item.path}`}
          className="orbit-tree-name orbit-tree-file-link"
          onClick={(e) => e.stopPropagation()}
        >
          {item.name}
        </Link>
      )}
      {item.size != null && (
        <span className="orbit-tree-size">
          {item.size < 1024 ? `${item.size} B` : `${(item.size / 1024).toFixed(1)} KB`}
        </span>
      )}
    </div>
  );
}

/* ── main component ─────────────────────────────────────── */
const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [branches, setBranches] = useState([]);
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [tree, setTree] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [readme, setReadme] = useState(null);
  const [recentCommits, setRecentCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [branchDropdown, setBranchDropdown] = useState(false);
  const [cloneDropdown, setCloneDropdown] = useState(false);

  /* fetch repo metadata */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [repoRes, statusRes] = await Promise.all([
          getRepoById(id),
          getRepoStatus(id),
        ]);
        setRepo(repoRes.data);
        const status = statusRes.data;
        setGitStatus(status);
        const db = status.defaultBranch || "main";
        setDefaultBranch(db);
        setSelectedBranch(db);
        if (status.branches) setBranches(status.branches);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load repository.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* fetch tree + readme + commits when branch/path changes */
  const loadTree = useCallback(async (branch, path) => {
    if (!gitStatus?.hasCommits) return;
    setTreeLoading(true);
    try {
      const [treeRes, readmeRes, commitsRes] = await Promise.all([
        getTree(id, branch, path),
        path === "" ? getReadme(id, branch) : Promise.resolve(null),
        path === "" ? getCommits(id, branch, 5) : Promise.resolve(null),
      ]);
      setTree(treeRes.data.tree || []);
      if (readmeRes) setReadme(readmeRes.data);
      if (commitsRes) setRecentCommits(commitsRes.data.commits || []);
    } catch (err) {
      console.error("loadTree error:", err);
    } finally {
      setTreeLoading(false);
    }
  }, [id, gitStatus]);

  useEffect(() => {
    if (selectedBranch) loadTree(selectedBranch, currentPath);
  }, [selectedBranch, currentPath, loadTree]);

  const handleBranchSwitch = (branch) => {
    setSelectedBranch(branch);
    setCurrentPath("");
    setBranchDropdown(false);
  };

  const navigatePath = (path) => setCurrentPath(path);
  const navigateUp = () => {
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  if (loading) {
    return (
      <div className="orbit-repo-loading">
        <div className="orbit-skeleton-card" style={{ height: 120 }} />
        <div className="orbit-skeleton-card" style={{ height: 320 }} />
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="orbit-repo-error">
        <AlertCircle size={32} />
        <p>{error || "Repository not found."}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Go back
        </Button>
      </div>
    );
  }

  const ownerName = repo.owner?.username || "unknown";
  const cloneUrl = gitStatus?.cloneInfo?.httpUrl || `http://localhost:3000/git/${id}.git`;

  const tabs = [
    { id: "code", label: "Code", icon: Code },
    { id: "issues", label: "Issues", icon: CircleDot },
    { id: "pulls", label: "Pull Requests", icon: GitPullRequest },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  return (
    <div className="orbit-repo-detail">
      {/* ── HEADER ───────────────────────────────── */}
      <div className="orbit-repo-header">
        <div className="orbit-repo-header-top">
          <h1 className="orbit-repo-title">
            <FolderGit2 size={22} className="orbit-repo-title-icon" />
            <Link to="/repo/all" className="orbit-repo-owner">{ownerName}</Link>
            <span className="orbit-repo-sep">/</span>
            <span className="orbit-repo-name">{repo.name}</span>
            <Badge variant={repo.visibility ? "neutral" : "warning"} style={{ marginLeft: 8 }}>
              {repo.visibility ? "Public" : "Private"}
            </Badge>
          </h1>
          <div className="orbit-repo-actions">
            <Button variant="outline" size="sm" disabled title="Watch">
              <Eye size={14} /> Watch
            </Button>
            <Button variant="outline" size="sm" disabled title="Fork">
              <GitFork size={14} /> Fork
            </Button>
            <Button variant="outline" size="sm" disabled title="Star">
              <Star size={14} /> Star
            </Button>
          </div>
        </div>
        {repo.description && (
          <p className="orbit-repo-description">{repo.description}</p>
        )}

        {/* TABS */}
        <div className="orbit-repo-tabs">
          {tabs.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              className={`orbit-repo-tab ${activeTab === tid ? "active" : ""}`}
              onClick={() => setActiveTab(tid)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CODE TAB ─────────────────────────────── */}
      {activeTab === "code" && (
        <div className="orbit-code-tab">
          {!gitStatus?.hasCommits ? (
            <EmptyRepoGuide repo={repo} repoId={id} cloneUrl={cloneUrl} />
          ) : (
            <>
              {/* Branch + actions bar */}
              <div className="orbit-code-toolbar">
                <div className="orbit-branch-selector" ref={null}>
                  <button
                    className="orbit-branch-btn"
                    onClick={() => setBranchDropdown((v) => !v)}
                  >
                    <GitBranch size={14} />
                    <span>{selectedBranch}</span>
                    <ChevronDown size={14} />
                  </button>
                  {branchDropdown && (
                    <div className="orbit-branch-dropdown">
                      <div className="orbit-branch-dropdown-header">Switch branch</div>
                      {branches.map((b) => (
                        <button
                          key={b}
                          className={`orbit-branch-option ${b === selectedBranch ? "active" : ""}`}
                          onClick={() => handleBranchSwitch(b)}
                        >
                          <GitBranch size={13} />
                          {b}
                          {b === defaultBranch && (
                            <span className="orbit-default-badge">default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="orbit-code-toolbar-right">
                  <Link to={`/repo/${id}/commits/${selectedBranch}`} className="orbit-toolbar-link">
                    <Clock size={14} />
                    {recentCommits.length > 0
                      ? `${recentCommits.length}+ commits`
                      : "Commits"}
                  </Link>
                  <div className="orbit-clone-wrapper">
                    <button
                      className="orbit-clone-btn"
                      onClick={() => setCloneDropdown((v) => !v)}
                    >
                      Code <ChevronDown size={13} />
                    </button>
                    {cloneDropdown && (
                      <div className="orbit-clone-dropdown">
                        <div className="orbit-clone-dropdown-header">Clone</div>
                        <div className="orbit-clone-url-row">
                          <code className="orbit-clone-url">{cloneUrl}</code>
                          <CopyButton text={cloneUrl} />
                        </div>
                        <p className="orbit-clone-note">
                          Push an existing repo with <code>git remote add origin {cloneUrl}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Latest commit banner */}
              {recentCommits[0] && currentPath === "" && (
                <div className="orbit-latest-commit-bar">
                  <div className="orbit-latest-commit-msg">
                    <Link to={`/repo/${id}/commits/${selectedBranch}/${recentCommits[0].hash}`}>
                      {recentCommits[0].message}
                    </Link>
                  </div>
                  <div className="orbit-latest-commit-meta">
                    <span>{recentCommits[0].author}</span>
                    <span>{timeAgo(recentCommits[0].date)}</span>
                    <Link to={`/repo/${id}/commits/${selectedBranch}/${recentCommits[0].hash}`}
                      className="orbit-commit-hash">
                      {recentCommits[0].shortHash}
                    </Link>
                  </div>
                </div>
              )}

              {/* Breadcrumb */}
              {currentPath && (
                <div className="orbit-breadcrumb">
                  <button onClick={() => { setCurrentPath(""); }} className="orbit-breadcrumb-item">
                    {repo.name}
                  </button>
                  {breadcrumbs.map((seg, i) => {
                    const partialPath = breadcrumbs.slice(0, i + 1).join("/");
                    const isLast = i === breadcrumbs.length - 1;
                    return (
                      <span key={partialPath}>
                        <ChevronRight size={13} className="orbit-breadcrumb-sep" />
                        {isLast ? (
                          <span className="orbit-breadcrumb-item current">{seg}</span>
                        ) : (
                          <button
                            className="orbit-breadcrumb-item"
                            onClick={() => navigatePath(partialPath)}
                          >
                            {seg}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* File tree */}
              <div className="orbit-file-tree-container">
                {treeLoading ? (
                  <div className="orbit-tree-loading">
                    <RefreshCw size={16} className="orbit-spin" /> Loading…
                  </div>
                ) : tree.length === 0 ? (
                  <div className="orbit-tree-empty">This directory is empty.</div>
                ) : (
                  <>
                    {currentPath && (
                      <div className="orbit-tree-row is-dir" onClick={navigateUp}>
                        <span className="orbit-tree-icon"><Folder size={15} /></span>
                        <span className="orbit-tree-name">..</span>
                      </div>
                    )}
                    {tree.map((item) => (
                      <TreeRow
                        key={item.path}
                        item={item}
                        repoId={id}
                        branch={selectedBranch}
                        onNavigate={navigatePath}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* README */}
              {!treeLoading && currentPath === "" && readme?.exists && (
                <ReadmeBlock content={readme.content} name={readme.name} />
              )}
              {!treeLoading && currentPath === "" && !readme?.exists && (
                <div className="orbit-readme-placeholder">
                  <FileText size={20} />
                  <p>Help others understand this project by adding a README.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ISSUES TAB ───────────────────────────── */}
      {activeTab === "issues" && (
        <IssuesTab repoId={id} />
      )}

      {/* ── PULL REQUESTS TAB ────────────────────── */}
      {activeTab === "pulls" && (
        <PullsTab repoId={id} branches={branches} defaultBranch={defaultBranch} hasCommits={gitStatus?.hasCommits} />
      )}

      {/* ── SETTINGS TAB ─────────────────────────── */}
      {activeTab === "settings" && (
        <SettingsTab repo={repo} repoId={id} />
      )}
    </div>
  );
};

/* ── Empty repo onboarding ────────────────────────────── */
function EmptyRepoGuide({ repo, repoId, cloneUrl }) {
  return (
    <div className="orbit-empty-repo">
      <div className="orbit-empty-repo-icon"><Terminal size={32} /></div>
      <h3>Get started with <strong>{repo.name}</strong></h3>
      <p>This repository is empty. Push your code to get started.</p>

      <div className="orbit-setup-steps">
        <div className="orbit-setup-step">
          <span className="orbit-step-label">Quick setup — push an existing repo</span>
          <div className="orbit-code-block">
            <code>git remote add origin {cloneUrl}</code>
            <CopyButton text={`git remote add origin ${cloneUrl}`} />
          </div>
        </div>
        <div className="orbit-setup-step">
          <span className="orbit-step-label">…or create a new repository on the command line</span>
          <div className="orbit-code-block multiline">
            <pre>{`echo "# ${repo.name}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin ${cloneUrl}
git push -u origin main`}</pre>
            <CopyButton text={`echo "# ${repo.name}" >> README.md\ngit init\ngit add README.md\ngit commit -m "first commit"\ngit branch -M main\ngit remote add origin ${cloneUrl}\ngit push -u origin main`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Issues tab (inline) ─────────────────────────────── */
import IssuesTab from "./tabs/IssuesTab";
import PullsTab from "./tabs/PullsTab";
import SettingsTab from "./tabs/SettingsTab";

export default RepositoryDetail;

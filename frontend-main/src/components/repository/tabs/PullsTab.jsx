import React, { useState, useEffect, useCallback } from "react";
import { GitPullRequest, Plus, GitMerge, X, RefreshCw, GitBranch } from "lucide-react";
import { getPRs, createPR, updatePR, mergePR } from "../../../api/prApi";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

const STATUS_BADGE = { open: "success", merged: "info", closed: "neutral" };

const PullsTab = ({ repoId, branches, defaultBranch, hasCommits }) => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", sourceBranch: "", targetBranch: defaultBranch });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [merging, setMerging] = useState(null);
  const userId = localStorage.getItem("userId");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPRs(repoId, { status: statusFilter });
      setPrs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load pull requests.");
    } finally {
      setLoading(false);
    }
  }, [repoId, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setForm(f => ({ ...f, targetBranch: defaultBranch })); }, [defaultBranch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.sourceBranch || !form.targetBranch) {
      setFormError("Title, source branch and target branch are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createPR(repoId, form);
      setShowCreate(false);
      setForm({ title: "", description: "", sourceBranch: "", targetBranch: defaultBranch });
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create pull request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (prId) => {
    try {
      await updatePR(repoId, prId, { status: "closed" });
      load();
    } catch (err) { console.error(err); }
  };

  const handleMerge = async (prId) => {
    if (!window.confirm("Are you sure you want to merge this pull request?")) return;
    setMerging(prId);
    try {
      await mergePR(repoId, prId);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Merge failed.");
    } finally {
      setMerging(null);
    }
  };

  const openCount = prs.filter(p => p.status === "open").length;
  const closedCount = prs.filter(p => p.status !== "open").length;

  return (
    <div className="orbit-tab-panel">
      <div className="orbit-issues-toolbar">
        <div className="orbit-status-tabs">
          <button className={`orbit-status-tab ${statusFilter === "open" ? "active" : ""}`} onClick={() => setStatusFilter("open")}>
            <GitPullRequest size={14} /> {openCount} Open
          </button>
          <button className={`orbit-status-tab ${statusFilter === "closed" ? "active" : ""}`} onClick={() => setStatusFilter("closed")}>
            <X size={14} /> {closedCount} Closed
          </button>
        </div>
        {userId && hasCommits && branches.length >= 2 && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Pull Request
          </Button>
        )}
      </div>

      {!hasCommits && (
        <div className="orbit-tab-empty">
          <GitPullRequest size={28} />
          <p>Push commits before creating a pull request.</p>
        </div>
      )}

      {showCreate && (
        <div className="orbit-create-form">
          <form onSubmit={handleCreate}>
            <h4>Open a Pull Request</h4>
            {formError && <p className="orbit-form-error">{formError}</p>}
            <input
              className="orbit-form-input"
              placeholder="Pull request title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <div className="orbit-form-branch-row">
              <div className="orbit-form-field">
                <label>Source branch</label>
                <select
                  className="orbit-form-select"
                  value={form.sourceBranch}
                  onChange={e => setForm(f => ({ ...f, sourceBranch: e.target.value }))}
                >
                  <option value="">Select branch…</option>
                  {branches.filter(b => b !== form.targetBranch).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div style={{ alignSelf: "flex-end", paddingBottom: 8, color: "var(--text-muted)" }}>→</div>
              <div className="orbit-form-field">
                <label>Target branch</label>
                <select
                  className="orbit-form-select"
                  value={form.targetBranch}
                  onChange={e => setForm(f => ({ ...f, targetBranch: e.target.value }))}
                >
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className="orbit-form-textarea"
              placeholder="Describe your changes…"
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="orbit-form-actions">
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create Pull Request"}</Button>
              <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="orbit-list-loading"><RefreshCw size={16} className="orbit-spin" /> Loading…</div>
      ) : error ? (
        <div className="orbit-tab-error"><p>{error}</p><Button variant="outline" onClick={load}>Retry</Button></div>
      ) : prs.length === 0 ? (
        <div className="orbit-tab-empty">
          <GitPullRequest size={28} />
          <p>No {statusFilter} pull requests.</p>
        </div>
      ) : (
        <div className="orbit-issue-list">
          {prs.map((pr) => (
            <div key={pr._id} className="orbit-issue-row">
              <div className="orbit-issue-row-left">
                {pr.status === "merged"
                  ? <GitMerge size={16} style={{ color: "var(--color-info, #8b5cf6)" }} />
                  : pr.status === "closed"
                    ? <X size={16} style={{ color: "var(--text-muted)" }} />
                    : <GitPullRequest size={16} style={{ color: "var(--color-success, #22c55e)" }} />}
              </div>
              <div className="orbit-issue-row-main">
                <div className="orbit-issue-title-row">
                  <span className="orbit-issue-title">{pr.title}</span>
                  <Badge variant={STATUS_BADGE[pr.status] || "neutral"}>{pr.status}</Badge>
                </div>
                <div className="orbit-issue-meta">
                  #{pr.number} · <GitBranch size={11} style={{ display: "inline" }} />
                  <span> {pr.sourceBranch} → {pr.targetBranch}</span>
                  {" · "}opened {timeAgo(pr.createdAt)}
                  {pr.author?.username && ` by ${pr.author.username}`}
                </div>
              </div>
              <div className="orbit-issue-row-right">
                {pr.status === "open" && userId && (
                  <>
                    <button
                      className="orbit-merge-btn"
                      onClick={() => handleMerge(pr._id)}
                      disabled={merging === pr._id}
                    >
                      <GitMerge size={13} /> {merging === pr._id ? "Merging…" : "Merge"}
                    </button>
                    <button className="orbit-issue-toggle-btn" onClick={() => handleClose(pr._id)}>
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PullsTab;

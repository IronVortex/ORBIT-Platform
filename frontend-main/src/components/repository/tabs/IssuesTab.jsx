import React, { useState, useEffect, useCallback } from "react";
import { CircleDot, Plus, User, X, RefreshCw } from "lucide-react";
import { getIssues, createIssue, updateIssue } from "../../../api/issueApi";
import Button from "../../ui/Button";

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

const IssuesTab = ({ repoId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", labels: [] });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const userId = localStorage.getItem("userId");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getIssues(repoId, { status: statusFilter });
      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, [repoId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createIssue(repoId, form);
      setShowCreate(false);
      setForm({ title: "", description: "", labels: [] });
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (issue) => {
    const newStatus = issue.status === "open" ? "closed" : "open";
    try {
      await updateIssue(repoId, issue._id, { status: newStatus });
      load();
    } catch (err) {
      console.error("toggleStatus error:", err);
    }
  };

  const openCount = issues.filter(i => i.status === "open").length;
  const closedCount = issues.filter(i => i.status === "closed").length;

  return (
    <div className="orbit-tab-panel">
      {/* Toolbar */}
      <div className="orbit-issues-toolbar">
        <div className="orbit-status-tabs">
          <button
            className={`orbit-status-tab ${statusFilter === "open" ? "active" : ""}`}
            onClick={() => setStatusFilter("open")}
          >
            <CircleDot size={14} /> {openCount} Open
          </button>
          <button
            className={`orbit-status-tab ${statusFilter === "closed" ? "active" : ""}`}
            onClick={() => setStatusFilter("closed")}
          >
            <X size={14} /> {closedCount} Closed
          </button>
        </div>
        {userId && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Issue
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="orbit-create-form">
          <form onSubmit={handleCreate}>
            <h4>New Issue</h4>
            {formError && <p className="orbit-form-error">{formError}</p>}
            <input
              className="orbit-form-input"
              placeholder="Issue title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="orbit-form-textarea"
              placeholder="Describe the issue…"
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="orbit-form-actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Issue"}
              </Button>
              <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="orbit-list-loading"><RefreshCw size={16} className="orbit-spin" /> Loading…</div>
      ) : error ? (
        <div className="orbit-tab-error"><p>{error}</p><Button variant="outline" onClick={load}>Retry</Button></div>
      ) : issues.length === 0 ? (
        <div className="orbit-tab-empty">
          <CircleDot size={28} />
          <p>No {statusFilter} issues.</p>
          {statusFilter === "open" && userId && (
            <Button size="sm" onClick={() => setShowCreate(true)}>Open an issue</Button>
          )}
        </div>
      ) : (
        <div className="orbit-issue-list">
          {issues.map((issue) => (
            <div key={issue._id} className="orbit-issue-row">
              <div className="orbit-issue-row-left">
                <CircleDot size={16} className={`orbit-issue-status-icon ${issue.status}`} />
              </div>
              <div className="orbit-issue-row-main">
                <div className="orbit-issue-title-row">
                  <span className="orbit-issue-title">{issue.title}</span>
                  {issue.labels?.map(l => (
                    <span key={l} className="orbit-issue-label">{l}</span>
                  ))}
                </div>
                <div className="orbit-issue-meta">
                  #{issue.number} opened {timeAgo(issue.createdAt)}
                  {issue.author?.username && ` by ${issue.author.username}`}
                  {issue.comments?.length > 0 && (
                    <span className="orbit-issue-comments"> · {issue.comments.length} comment{issue.comments.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
              <div className="orbit-issue-row-right">
                {issue.assignee?.username && (
                  <span className="orbit-issue-assignee" title={`Assigned to ${issue.assignee.username}`}>
                    <User size={13} />
                  </span>
                )}
                {userId && (
                  <button
                    className="orbit-issue-toggle-btn"
                    onClick={() => toggleStatus(issue)}
                    title={issue.status === "open" ? "Close issue" : "Reopen issue"}
                  >
                    {issue.status === "open" ? "Close" : "Reopen"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssuesTab;

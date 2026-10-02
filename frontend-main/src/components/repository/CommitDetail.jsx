import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GitCommit, RefreshCw, Plus, Minus } from "lucide-react";
import { getCommitDetail } from "../../api/gitApi";
import "../repository/RepositoryDetail.css";

function timeAgo(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

/* Renders a unified diff string with syntax highlighting */
function DiffViewer({ diff }) {
  if (!diff) return <p style={{ padding: 20, color: "var(--text-muted)" }}>No changes in this commit.</p>;

  const lines = diff.split("\n");
  return (
    <div className="orbit-diff-viewer">
      {lines.map((line, i) => {
        if (line.startsWith("@@")) return <div key={i} className="orbit-diff-hunk-header">{line}</div>;
        if (line.startsWith("+") && !line.startsWith("+++")) return <div key={i} className="orbit-diff-add">{line}</div>;
        if (line.startsWith("-") && !line.startsWith("---")) return <div key={i} className="orbit-diff-remove">{line}</div>;
        if (line.startsWith("diff ") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
          return <div key={i} className="orbit-diff-hunk-header">{line}</div>;
        }
        return <div key={i} className="orbit-diff-context">{line}</div>;
      })}
    </div>
  );
}

const CommitDetail = () => {
  const { id, branch, hash } = useParams();
  const navigate = useNavigate();
  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCommitDetail(id, branch, hash);
        setCommit(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load commit.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, branch, hash]);

  return (
    <div className="orbit-commits-page">
      <button onClick={() => navigate(`/repo/${id}/commits/${branch}`)} className="orbit-back-btn">
        <ArrowLeft size={15} /> Back to commits
      </button>

      {loading ? (
        <div className="orbit-list-loading"><RefreshCw size={16} className="orbit-spin" /> Loading…</div>
      ) : error ? (
        <div className="orbit-tab-error"><p>{error}</p></div>
      ) : commit ? (
        <>
          <div className="orbit-commit-detail-header">
            <div className="orbit-commit-detail-icon"><GitCommit size={20} /></div>
            <div>
              <h2>{commit.message}</h2>
              {commit.body && <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>{commit.body}</p>}
              <div className="orbit-commit-meta" style={{ marginTop: 8, fontSize: 13 }}>
                <strong>{commit.author}</strong>
                {" "}&lt;{commit.authorEmail}&gt;{" · "}
                {timeAgo(commit.date)}
              </div>
              <div style={{ marginTop: 8 }}>
                <code className="orbit-commit-hash-badge" style={{ fontSize: 13 }}>{commit.hash}</code>
              </div>
            </div>
          </div>

          {commit.diffStat && (
            <div className="orbit-diff-stat">
              <pre>{commit.diffStat}</pre>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, color: "var(--text-secondary)" }}>Changes</h3>
            <div className="orbit-file-content">
              <DiffViewer diff={commit.diff} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CommitDetail;

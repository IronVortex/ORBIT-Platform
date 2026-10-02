import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, RefreshCw, GitCommit } from "lucide-react";
import { getCommits, getBranches } from "../../api/gitApi";
import Button from "../ui/Button";
import "../repository/RepositoryDetail.css";

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

const CommitHistory = () => {
  const { id, branch } = useParams();
  const navigate = useNavigate();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCommits(id, branch, 50);
        setCommits(res.data.commits || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load commits.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, branch]);

  return (
    <div className="orbit-commits-page">
      <div className="orbit-commits-header">
        <button onClick={() => navigate(`/repo/${id}`)} className="orbit-back-btn">
          <ArrowLeft size={15} /> Back to repository
        </button>
        <h2 style={{ marginTop: 16 }}>
          <Clock size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Commits on <code style={{ fontSize: 16 }}>{branch}</code>
        </h2>
      </div>

      {loading ? (
        <div className="orbit-list-loading"><RefreshCw size={16} className="orbit-spin" /> Loading commits…</div>
      ) : error ? (
        <div className="orbit-tab-error"><p>{error}</p></div>
      ) : commits.length === 0 ? (
        <div className="orbit-tab-empty">
          <GitCommit size={28} />
          <p>No commits on this branch yet.</p>
        </div>
      ) : (
        <div className="orbit-commit-list">
          {commits.map((commit) => (
            <div key={commit.hash} className="orbit-commit-item">
              <div className="orbit-commit-avatar">
                {commit.author ? commit.author.slice(0, 2).toUpperCase() : "??"}
              </div>
              <div className="orbit-commit-body">
                <Link
                  to={`/repo/${id}/commits/${branch}/${commit.hash}`}
                  className="orbit-commit-msg-link"
                >
                  {commit.message}
                </Link>
                <div className="orbit-commit-meta">
                  <strong>{commit.author}</strong> committed {timeAgo(commit.date)}
                </div>
              </div>
              <div className="orbit-commit-right">
                <Link
                  to={`/repo/${id}/commits/${branch}/${commit.hash}`}
                  className="orbit-commit-hash-badge"
                >
                  {commit.shortHash}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitHistory;

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, File as FileIcon, RefreshCw, AlertCircle, ChevronRight, Download } from "lucide-react";
import { getBlob } from "../../api/gitApi";
import Button from "../ui/Button";
import "../repository/RepositoryDetail.css";

const FileViewer = () => {
  const { id, branch, "*": filePath } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getBlob(id, branch, filePath);
        setFileData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load file.");
      } finally {
        setLoading(false);
      }
    };
    if (filePath) load();
  }, [id, branch, filePath]);

  const breadcrumbs = filePath ? filePath.split("/") : [];

  return (
    <div className="orbit-file-viewer">
      <div className="orbit-file-viewer-header">
        <button onClick={() => navigate(`/repo/${id}`)} className="orbit-back-btn" style={{ marginRight: 16 }}>
          <ArrowLeft size={15} /> Repo
        </button>
        <div className="orbit-file-viewer-breadcrumb">
          <Link to={`/repo/${id}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>root</Link>
          {breadcrumbs.map((seg, i) => (
            <React.Fragment key={i}>
              <ChevronRight size={14} style={{ color: "var(--text-muted)", margin: "0 4px" }} />
              {i === breadcrumbs.length - 1 ? (
                <strong style={{ color: "var(--text-primary)" }}>{seg}</strong>
              ) : (
                <span style={{ color: "var(--text-secondary)" }}>{seg}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="orbit-list-loading"><RefreshCw size={16} className="orbit-spin" /> Loading file…</div>
      ) : error ? (
        <div className="orbit-tab-error">
          <AlertCircle size={32} />
          <p>{error}</p>
        </div>
      ) : fileData ? (
        <div className="orbit-file-content">
          <div className="orbit-file-content-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileIcon size={16} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {fileData.size < 1024 ? `${fileData.size} Bytes` : `${(fileData.size / 1024).toFixed(2)} KB`}
              </span>
            </div>
            {/* Download button could hook to a raw API endpoint later */}
            <Button size="sm" variant="outline" disabled title="Raw view not available yet">
              <Download size={13} /> Raw
            </Button>
          </div>
          <div className="orbit-file-content-body">
            {fileData.isBinary ? (
              <div className="orbit-binary-notice">
                <FileIcon size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                <p>This is a binary file and cannot be displayed as text.</p>
              </div>
            ) : (
              <pre className="orbit-file-pre">{fileData.content}</pre>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileViewer;

import React, { useState } from "react";
import { Settings, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { deleteRepo, toggleVisibility, updateRepo } from "../../../api/repoApi";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";

const SettingsTab = ({ repo, repoId }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState(repo.description || "");
  const [language, setLanguage] = useState(repo.language || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const userId = localStorage.getItem("userId");
  const isOwner = repo.owner?._id === userId || repo.owner === userId;

  if (!isOwner) {
    return (
      <div className="orbit-tab-panel">
        <div className="orbit-tab-empty">
          <Settings size={28} />
          <p>Only the repository owner can access settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRepo(repoId, { description, language });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      await toggleVisibility(repoId);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to toggle visibility.");
    }
  };

  const handleDelete = async () => {
    if (confirmName !== repo.name) {
      alert("Repository name does not match.");
      return;
    }
    setDeleting(true);
    try {
      await deleteRepo(repoId);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete.");
      setDeleting(false);
    }
  };

  return (
    <div className="orbit-tab-panel orbit-settings-tab">
      <section className="orbit-settings-section">
        <h3>General</h3>
        <form onSubmit={handleSave}>
          <div className="orbit-form-field">
            <label>Description</label>
            <input
              className="orbit-form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the repository"
            />
          </div>
          <div className="orbit-form-field">
            <label>Language</label>
            <input
              className="orbit-form-input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              placeholder="e.g. JavaScript, Python"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </Button>
        </form>
      </section>

      <section className="orbit-settings-section">
        <h3>Visibility</h3>
        <div className="orbit-settings-row">
          <div>
            <strong>{repo.visibility ? "Public" : "Private"}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              {repo.visibility
                ? "Anyone can view this repository."
                : "Only you can view this repository."}
            </p>
          </div>
          <Button variant="outline" onClick={handleToggle} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {repo.visibility ? <EyeOff size={14} /> : <Eye size={14} />}
            {repo.visibility ? "Make Private" : "Make Public"}
          </Button>
        </div>
      </section>

      <section className="orbit-settings-section orbit-danger-zone">
        <h3><AlertTriangle size={16} /> Danger Zone</h3>
        <div className="orbit-settings-row">
          <div>
            <strong>Delete this repository</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              This action cannot be undone. All data will be permanently deleted.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <input
              className="orbit-form-input"
              placeholder={`Type "${repo.name}" to confirm`}
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              style={{ width: 220 }}
            />
            <Button
              variant="danger"
              disabled={confirmName !== repo.name || deleting}
              onClick={handleDelete}
              style={{ display: "flex", gap: 6, alignItems: "center" }}
            >
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete repository"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsTab;

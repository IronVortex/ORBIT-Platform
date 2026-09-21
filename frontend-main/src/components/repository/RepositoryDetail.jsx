import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { FolderGit2, CircleDot, GitPullRequest, Settings, Eye, GitFork, Star, Code, GitBranch, FileCode } from "lucide-react";

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState("code");

  useEffect(() => {
    const fetchRepository = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/repo/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load repository.");
        }

        const repo = Array.isArray(data) ? data[0] : data;
        setRepository(repo || null);
      } catch (err) {
        setError(err.message || "Unable to load repository.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="orbit-skeleton-card" style={{ height: "120px" }}><div className="skeleton-line" /></div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="orbit-error-state">{error || "Repository not found"}</div>
      </div>
    );
  }

  const tabs = [
    { id: "code", label: "Code", icon: Code },
    { id: "issues", label: "Issues", icon: CircleDot },
    { id: "pulls", label: "Pull Requests", icon: GitPullRequest },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Repo Header */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', padding: '24px 32px 0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', margin: '0 0 8px 0', color: 'var(--color-primary)' }}>
              <FolderGit2 size={24} style={{ color: 'var(--text-muted)' }} />
              <span>{repository.owner?.username || repository.owner || "User"}</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{repository.name}</span>
              <Badge variant="neutral">{repository.visibility ? "Public" : "Private"}</Badge>
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{repository.description || "No description provided."}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} /> Watch</Button>
             <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GitFork size={16} /> Fork</Button>
             <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} /> Star</Button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid transparent' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: activeTab === tab.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBottom: '-1px'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', flexGrow: 1 }}>
        {activeTab === "code" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GitBranch size={16} /> Branch: main ▾</Button>
              <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileCode size={16} /> Code ▾</Button>
            </div>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Initial commit</div>
                <div>2 days ago</div>
              </div>
              
              <EmptyState 
                title="Repository is empty"
                description="This repository has no files. You can initialize it by creating a new file or pushing an existing local repository."
                actionText="Create new file"
              />
            </div>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={18} /> README.md
              </h3>
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>Help people interested in this repository understand your project by adding a README.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "code" && (
          <EmptyState 
            title={`${tabs.find(t => t.id === activeTab).label} is not available`}
            description={`The ${tabs.find(t => t.id === activeTab).label.toLowerCase()} feature is currently under development.`}
          />
        )}
      </div>
    </div>
  );
};

export default RepositoryDetail;

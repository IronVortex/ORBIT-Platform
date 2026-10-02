import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FolderGit2, Plus, Search, Globe, ArrowRight, BookOpen, RefreshCw } from "lucide-react";
import { getUserRepos, getRepos } from "../../api/repoApi";
import { getUser } from "../../api/userApi";
import HeatMapProfile from "../user/HeatMap";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import "./dashboard.css";

const SkeletonCard = () => (
  <div className="orbit-skeleton-card">
    <div className="skeleton-line" style={{ width: "60%", marginBottom: 8 }} />
    <div className="skeleton-line short" style={{ width: "40%" }} />
  </div>
);

const Dashboard = () => {
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exploreRepos, setExploreRepos] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [repoError, setRepoError] = useState("");
  const [exploreError, setExploreError] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getUser(userId);
      setUserDetails(res.data);
    } catch (err) {
      console.error("fetchUser error:", err);
    }
  }, [userId]);

  const fetchRepos = useCallback(async () => {
    if (!userId) return;
    setLoadingRepos(true);
    setRepoError("");
    try {
      const res = await getUserRepos(userId);
      setRepos(Array.isArray(res.data?.repositories) ? res.data.repositories : []);
    } catch (err) {
      console.error("fetchRepos error:", err);
      setRepoError("Could not load repositories. Is the server running?");
    } finally {
      setLoadingRepos(false);
    }
  }, [userId]);

  const fetchExplore = useCallback(async () => {
    setLoadingExplore(true);
    setExploreError("");
    try {
      const res = await getRepos();
      setExploreRepos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchExplore error:", err);
      setExploreError("Could not load explore feed.");
    } finally {
      setLoadingExplore(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchRepos();
    fetchExplore();
  }, [fetchUser, fetchRepos, fetchExplore]);

  const filteredRepos = repos.filter((r) =>
    !searchQuery || r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initials = userDetails?.username
    ? userDetails.username.slice(0, 2).toUpperCase()
    : "??";

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="orbit-dashboard-page">
      <main className="orbit-dashboard-container">
        <header className="orbit-dashboard-header">
          <div>
            <h1>
              {timeOfDay()},{" "}
              <span className="orbit-gradient-text">
                {userDetails?.username || "Developer"}
              </span>
            </h1>
            <p className="orbit-text-muted">Your developer workspace</p>
          </div>
          <Link to="/create">
            <Button style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} /> New Repository
            </Button>
          </Link>
        </header>

        <div className="orbit-dashboard-grid">
          <div className="orbit-dashboard-main">

            {/* YOUR REPOS */}
            <section className="orbit-dashboard-section">
              <div className="orbit-dashboard-section-header">
                <h2>Your Repositories</h2>
                <div className="orbit-search-field">
                  <Search size={15} className="orbit-search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="Filter repositories…"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="orbit-search-input"
                  />
                </div>
              </div>

              {loadingRepos ? (
                <div className="orbit-repo-grid">
                  <SkeletonCard /><SkeletonCard />
                </div>
              ) : repoError ? (
                <div className="orbit-error-state">
                  <p>{repoError}</p>
                  <Button variant="outline" onClick={fetchRepos} style={{ marginTop: 12, display: "flex", gap: 6, alignItems: "center" }}>
                    <RefreshCw size={14} /> Retry
                  </Button>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="orbit-empty-state">
                  <FolderGit2 size={36} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                  <p style={{ marginBottom: 16 }}>
                    {searchQuery ? "No matching repositories." : "No repositories yet."}
                  </p>
                  {!searchQuery && (
                    <Link to="/create">
                      <Button><Plus size={14} style={{ marginRight: 6 }} />Create Repository</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="orbit-repo-list">
                  {filteredRepos.map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="orbit-repo-list-item">
                      <div className="orbit-repo-list-main">
                        <span className="orbit-repo-list-name">
                          <FolderGit2 size={15} /> {repo.name}
                        </span>
                        <span className="orbit-repo-list-desc">
                          {repo.description || "No description"}
                        </span>
                        <div className="orbit-repo-list-meta">
                          {repo.language && (
                            <span className="orbit-lang-tag">
                              <span className="orbit-lang-dot" />
                              {repo.language}
                            </span>
                          )}
                          <span className="orbit-repo-updated">
                            Updated {new Date(repo.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={repo.visibility ? "neutral" : "warning"}>
                        {repo.visibility ? "Public" : "Private"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* HEATMAP */}
            <section className="orbit-dashboard-section">
              <h2>Contribution Activity</h2>
              <div className="orbit-activity-card">
                <HeatMapProfile />
              </div>
            </section>

            {/* EXPLORE */}
            <section className="orbit-dashboard-section">
              <h2>Explore Repositories</h2>
              {loadingExplore ? (
                <div className="orbit-repo-grid"><SkeletonCard /><SkeletonCard /></div>
              ) : exploreError ? (
                <div className="orbit-error-state">
                  <p>{exploreError}</p>
                  <Button variant="outline" onClick={fetchExplore} style={{ marginTop: 12 }}>Retry</Button>
                </div>
              ) : exploreRepos.length === 0 ? (
                <div className="orbit-empty-state" style={{ padding: "20px 0" }}>
                  <Globe size={28} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No public repositories to explore yet.</p>
                </div>
              ) : (
                <div className="orbit-repo-list">
                  {exploreRepos.slice(0, 6).map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="orbit-repo-list-item">
                      <div className="orbit-repo-list-main">
                        <span className="orbit-repo-list-name">
                          <BookOpen size={15} />
                          {repo.owner?.username && (
                            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                              {repo.owner.username}/
                            </span>
                          )}
                          {repo.name}
                        </span>
                        <span className="orbit-repo-list-desc">
                          {repo.description || "No description"}
                        </span>
                      </div>
                      <ArrowRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="orbit-dashboard-sidebar">
            <div className="orbit-profile-identity">
              <div className="orbit-profile-avatar">{initials}</div>
              <div className="orbit-profile-info">
                <strong>{userDetails?.username || "Developer"}</strong>
                <span>{userDetails?.email || ""}</span>
              </div>
              <Link to="/profile" className="orbit-profile-link">
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="orbit-quick-actions">
              <h4>Quick Actions</h4>
              <ul>
                <li><Link to="/create"><Plus size={14} /> New Repository</Link></li>
                <li><Link to="/repo/all"><Globe size={14} /> Explore</Link></li>
                <li><Link to="/issues"><FolderGit2 size={14} /> Issues</Link></li>
              </ul>
            </div>

            <div className="orbit-stats-card">
              <h4>Overview</h4>
              <div className="orbit-stat-row">
                <span className="orbit-stat-label">Repositories</span>
                <span className="orbit-stat-value">{repos.length}</span>
              </div>
              <div className="orbit-stat-row">
                <span className="orbit-stat-label">Public repos</span>
                <span className="orbit-stat-value">{exploreRepos.length}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
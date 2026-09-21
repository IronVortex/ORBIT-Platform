import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import HeatMapProfile from "../user/HeatMap";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  
  const [userDetails, setUserDetails] = useState(null);
  
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(true);
  
  const [repoError, setRepoError] = useState("");
  const [suggestedError, setSuggestedError] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:3000/userProfile/${userId}`);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Cannot fetch user details: ", err);
    }
  }, [userId]);

  const fetchRepositories = useCallback(async () => {
    setIsLoadingRepos(true);
    setRepoError("");
    try {
      const response = await axios.get(`http://localhost:3000/repo/user/${userId}`);
      setRepositories(Array.isArray(response.data.repositories) ? response.data.repositories : []);
    } catch (err) {
      console.error("Error while fetching repositories: ", err);
      setRepoError("Unable to load repositories. Please check your connection and try again.");
    } finally {
      setIsLoadingRepos(false);
    }
  }, [userId]);

  const fetchSuggestedRepositories = useCallback(async () => {
    setIsLoadingSuggested(true);
    setSuggestedError("");
    try {
      const response = await axios.get(`http://localhost:3000/repo/all`);
      setSuggestedRepositories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error while fetching suggested repositories: ", err);
      setSuggestedError("Unable to load repositories to explore.");
    } finally {
      setIsLoadingSuggested(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchRepositories();
    fetchSuggestedRepositories();
  }, [fetchUserDetails, fetchRepositories, fetchSuggestedRepositories]);

  useEffect(() => {
    const safeRepositories = Array.isArray(repositories) ? repositories : [];
    if (searchQuery.trim() === "") {
      setSearchResults(safeRepositories);
      return;
    }
    const filteredRepo = safeRepositories.filter((repo) =>
      repo && repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredRepo);
  }, [searchQuery, repositories]);

  // Derived initials
  const initials = userDetails?.username 
    ? userDetails.username.substring(0, 2).toUpperCase() 
    : "??";

  return (
    <div className="orbit-theme orbit-dashboard-page">
      <Navbar />
      
      <main className="orbit-dashboard-container">
        
        {/* HEADER */}
        <header className="orbit-dashboard-header">
          <div>
            <h1>Good morning, {userDetails?.username || "Developer"}</h1>
            <p className="orbit-text-muted">Your developer workspace</p>
          </div>
          <div>
            <Link to="/create">
              <Button>+ New Repository</Button>
            </Link>
          </div>
        </header>

        <div className="orbit-dashboard-grid">
          {/* MAIN WORKSPACE */}
          <div className="orbit-dashboard-main">
            
            {/* YOUR REPOSITORIES */}
            <section className="orbit-dashboard-section">
              <div className="orbit-dashboard-section-header">
                <h2>Your Repositories</h2>
                <div className="orbit-search-container">
                  <Input
                    type="text"
                    value={searchQuery}
                    placeholder="Search repositories..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoadingRepos ? (
                <div className="orbit-repo-grid">
                  <div className="orbit-skeleton-card"><div className="skeleton-line" /><div className="skeleton-line short" /></div>
                  <div className="orbit-skeleton-card"><div className="skeleton-line" /><div className="skeleton-line short" /></div>
                </div>
              ) : repoError ? (
                <div className="orbit-error-state">
                  <p>{repoError}</p>
                  <Button variant="outline" onClick={fetchRepositories} style={{ marginTop: '12px' }}>Retry</Button>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="orbit-empty-state">
                  <p>No repositories found.</p>
                  <Link to="/create">
                    <Button variant="primary">Create Repository</Button>
                  </Link>
                </div>
              ) : (
                <div className="orbit-repo-grid">
                  {searchResults.map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="orbit-repo-card-link">
                      <div className="orbit-repo-card">
                        <div className="orbit-repo-card-header">
                          <h4 className="orbit-repo-name">
                            <span className="orbit-repo-icon">◇</span> {repo.name}
                          </h4>
                          <Badge variant="neutral">Public</Badge>
                        </div>
                        <p className="orbit-repo-desc">{repo.description || "No description provided."}</p>
                        <div className="orbit-repo-meta">
                          {repo.language ? (
                            <span><span className="orbit-lang-dot"></span>{repo.language}</span>
                          ) : (
                            <span><span className="orbit-lang-dot"></span>JavaScript</span>
                          )}
                          <span className="orbit-repo-arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* CONTRIBUTION ACTIVITY */}
            <section className="orbit-dashboard-section">
              <h2>Contribution Activity</h2>
              <div className="orbit-activity-card">
                <HeatMapProfile />
              </div>
            </section>

            {/* EXPLORE REPOSITORIES */}
            <section className="orbit-dashboard-section">
              <h2>Explore Repositories</h2>
              
              {isLoadingSuggested ? (
                <div className="orbit-repo-grid">
                  <div className="orbit-skeleton-card"><div className="skeleton-line" /><div className="skeleton-line short" /></div>
                </div>
              ) : suggestedError ? (
                <div className="orbit-error-state">
                  <p>{suggestedError}</p>
                  <Button variant="outline" onClick={fetchSuggestedRepositories} style={{ marginTop: '12px' }}>Retry</Button>
                </div>
              ) : suggestedRepositories.length === 0 ? (
                <div className="orbit-empty-state" style={{ padding: '24px' }}>
                  <p style={{ margin: 0 }}>No repositories to explore yet.</p>
                </div>
              ) : (
                <div className="orbit-repo-grid">
                  {suggestedRepositories.slice(0, 4).map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="orbit-repo-card-link">
                      <div className="orbit-explore-card">
                        <div className="orbit-explore-card-header">
                          <h4 className="orbit-repo-name">{repo.name}</h4>
                          <Badge variant="neutral">Public</Badge>
                        </div>
                        <p className="orbit-repo-desc">{repo.description || "No description provided."}</p>
                        <div className="orbit-repo-meta">
                           {repo.language ? (
                            <span><span className="orbit-lang-dot"></span>{repo.language}</span>
                          ) : null}
                          <span className="orbit-repo-arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="orbit-dashboard-sidebar">
            {/* PROFILE IDENTITY */}
            <div className="orbit-profile-identity">
              <div className="orbit-profile-avatar">{initials}</div>
              <div className="orbit-profile-info">
                <h4>{userDetails?.username || "Developer"}</h4>
                <p>Developer</p>
              </div>
              <Link to="/profile" className="orbit-profile-link" aria-label="View Profile">
                →
              </Link>
            </div>

            {/* QUICK ACTIONS */}
            <div className="orbit-quick-actions">
              <h4>Quick Actions</h4>
              <ul>
                <li><Link to="/create"><span>+</span> New Repository</Link></li>
                <li><Link to="/repo/all"><span>◇</span> Explore</Link></li>
                <li><Link to="/profile"><span>👤</span> Profile</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

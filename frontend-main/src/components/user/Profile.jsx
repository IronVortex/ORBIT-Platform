import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import HeatMapProfile from "./HeatMap";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { useAuth } from "../../authContext";
import { FolderGit2, LogOut, Edit2 } from "lucide-react";
import "./profile.css";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: "Developer" });
  const [repositories, setRepositories] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  
  const userId = localStorage.getItem("userId");
  const { setCurrentUser } = useAuth();

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
    if (!userId) return;
    setIsLoadingRepos(true);
    try {
      const response = await axios.get(`http://localhost:3000/repo/user/${userId}`);
      setRepositories(Array.isArray(response.data.repositories) ? response.data.repositories : []);
    } catch (err) {
      console.error("Error while fetching repositories: ", err);
    } finally {
      setIsLoadingRepos(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
    fetchRepositories();
  }, [fetchUserDetails, fetchRepositories]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/auth";
  };

  const initials = userDetails.username ? userDetails.username.substring(0, 2).toUpperCase() : "??";

  return (
    <div className="orbit-profile-page">
      <div className="orbit-profile-layout">
        
        <aside className="orbit-profile-sidebar">
          <div className="orbit-profile-avatar-large">{initials}</div>
          <h1 className="orbit-profile-name">{userDetails.username}</h1>
          <p className="orbit-profile-handle">@{userDetails.username}</p>
          
          <Link to="/settings" style={{ display: 'block', width: '100%', marginTop: '16px', textDecoration: 'none' }}>
            <Button variant="outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Edit2 size={16} /> Edit Profile
            </Button>
          </Link>

          <Button variant="danger" style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </aside>

        <main className="orbit-profile-main">
          <section className="orbit-profile-section">
            <h2 className="orbit-profile-section-title">Overview</h2>
            
            <div className="orbit-activity-card">
              <HeatMapProfile />
            </div>
          </section>

          <section className="orbit-profile-section">
            <h2 className="orbit-profile-section-title">Repositories <Badge variant="neutral">{repositories.length}</Badge></h2>
            
            {isLoadingRepos ? (
               <div className="orbit-repo-grid">
                 <div className="orbit-skeleton-card"><div className="skeleton-line" /></div>
                 <div className="orbit-skeleton-card"><div className="skeleton-line" /></div>
               </div>
            ) : repositories.length === 0 ? (
               <EmptyState 
                 title="No repositories yet" 
                 description="Create a repository to start tracking your code."
                 actionText="Create Repository"
                 onAction={() => window.location.href = "/create"}
               />
            ) : (
              <div className="orbit-repo-grid">
                {repositories.map((repo) => (
                  <Link key={repo._id} to={`/repo/${repo._id}`} className="orbit-repo-card-link">
                    <div className="orbit-repo-card">
                      <div className="orbit-repo-card-header">
                        <h4 className="orbit-repo-name">
                          <span className="orbit-repo-icon"><FolderGit2 size={16} /></span> {repo.name}
                        </h4>
                        <Badge variant="neutral">Public</Badge>
                      </div>
                      <p className="orbit-repo-desc">{repo.description || "No description provided."}</p>
                      <div className="orbit-repo-meta">
                        {repo.language ? (
                          <span><span className="orbit-lang-dot"></span>{repo.language}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

      </div>
    </div>
  );
};

export default Profile;

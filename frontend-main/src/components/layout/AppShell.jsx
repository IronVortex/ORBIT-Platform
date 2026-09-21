import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";
import { useTheme } from "../../ThemeContext";
import { LayoutDashboard, FolderGit2, CircleDot, GitPullRequest, User, Settings, LogOut, Bell, Moon, Sun } from "lucide-react";
import "./AppShell.css";

const AppShell = ({ children }) => {
  const { setCurrentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/auth";
  };

  const navItems = [
    { label: "Overview", path: "/", icon: LayoutDashboard },
    { label: "Repositories", path: "/repo/all", icon: FolderGit2 },
    { label: "Issues", path: "/issues", icon: CircleDot },
    { label: "Pull Requests", path: "/pulls", icon: GitPullRequest },
  ];

  return (
    <div className="orbit-theme orbit-app-shell">
      <aside className="orbit-sidebar">
        <div className="orbit-sidebar-header">
          <Link to="/" className="orbit-brand">
            <span className="orbit-brand-icon">◇</span> ORBIT
          </Link>
        </div>
        
        <nav className="orbit-sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`orbit-sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} className="orbit-sidebar-link-icon" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="orbit-sidebar-footer">
          <Link to="/profile" className="orbit-sidebar-link">
            <User size={18} className="orbit-sidebar-link-icon" />
            Profile
          </Link>
          <Link to="/settings" className="orbit-sidebar-link">
            <Settings size={18} className="orbit-sidebar-link-icon" />
            Settings
          </Link>
          <button className="orbit-sidebar-link" onClick={toggleTheme} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
            {theme === "light" ? <Moon size={18} className="orbit-sidebar-link-icon" /> : <Sun size={18} className="orbit-sidebar-link-icon" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <button className="orbit-sidebar-link orbit-logout-btn" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={18} className="orbit-sidebar-link-icon" />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="orbit-main-content">
        <header className="orbit-topbar">
          <div className="orbit-topbar-search">
            <input type="text" placeholder="Search ORBIT..." className="orbit-global-search" />
          </div>
          <div className="orbit-topbar-actions">
            <Link to="/create" className="orbit-btn orbit-btn-primary orbit-btn-sm">+ New</Link>
            <Link to="/notifications" className="orbit-notification-bell">
              <Bell size={20} />
            </Link>
          </div>
        </header>
        <div className="orbit-page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;

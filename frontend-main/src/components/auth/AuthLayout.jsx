import React from "react";
import { useState, useEffect } from 'react';
import './auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="orbit-auth-layout">
      <button className="orbit-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="orbit-auth-left">
        <div className="orbit-auth-brand">
          <div className="orbit-logo">
            <span className="orbit-logo-mark">O</span>
            <span className="orbit-logo-text">ORBIT</span>
          </div>
          <div className="orbit-auth-hero-content">
            <h1>Build. Collaborate. Ship.</h1>
            <p>One workspace for your repositories, teams, issues, and the work that moves software forward.</p>
          </div>
          
          <div className="orbit-hero-visual">
            <div className="orbit-visual-node orbit-node-1"></div>
            <div className="orbit-visual-node orbit-node-2"></div>
            <div className="orbit-visual-node orbit-node-3"></div>
            <svg className="orbit-visual-connections" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,150 C50,100 150,100 150,50" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M50,150 C100,150 150,150 150,150" stroke="currentColor" fill="none" strokeWidth="2" opacity="0.3" />
            </svg>
            <div className="orbit-visual-panel">
              <div className="orbit-panel-header">
                <span className="orbit-dot red"></span>
                <span className="orbit-dot yellow"></span>
                <span className="orbit-dot green"></span>
              </div>
              <div className="orbit-panel-body">
                <div className="orbit-line w-3/4"></div>
                <div className="orbit-line w-1/2"></div>
                <div className="orbit-line w-full"></div>
                <div className="orbit-line w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="orbit-auth-right">
        <div className="orbit-auth-card">
          <div className="orbit-auth-header">
            <h2>{title}</h2>
            {subtitle && <p className="orbit-text-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

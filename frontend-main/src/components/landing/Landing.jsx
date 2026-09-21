import React from 'react';
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import "./Landing.css";
import { useTheme } from "../../ThemeContext";
import { GitBranch, MessageSquare, Users, Moon, Sun, ArrowRight } from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="orbit-theme orbit-landing">
      <header className="orbit-landing-header">
        <div className="orbit-brand">
          <span className="orbit-brand-icon">◇</span> ORBIT
        </div>
        <nav className="orbit-landing-nav">
          <button className="orbit-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/auth" className="orbit-nav-link">Log in</Link>
          <Link to="/signup"><Button variant="primary">Sign up</Button></Link>
        </nav>
      </header>

      <main className="orbit-landing-main">
        <section className="orbit-hero">
          <h1 className="orbit-hero-title">Build. Collaborate. Ship.</h1>
          <p className="orbit-hero-subtitle">
            The professional developer platform for modern engineering teams. 
            Host your code, track your issues, and merge with confidence.
          </p>
          <div className="orbit-hero-actions">
            <Link to="/signup"><Button variant="primary" style={{ padding: "12px 24px", fontSize: "16px", display: 'flex', alignItems: 'center', gap: '8px' }}>Get Started <ArrowRight size={18} /></Button></Link>
            <Link to="/auth"><Button variant="outline" style={{ padding: "12px 24px", fontSize: "16px" }}>Log In</Button></Link>
          </div>
        </section>

        <section className="orbit-landing-visual">
          <div className="orbit-mockup-window">
            <div className="orbit-mockup-header">
              <span className="mockup-dot red"></span>
              <span className="mockup-dot yellow"></span>
              <span className="mockup-dot green"></span>
            </div>
            <div className="orbit-mockup-body">
              <pre><code>
<span className="code-keyword">import</span> {'{'} <span className="code-variable">Workspace</span> {'}'} <span className="code-keyword">from</span> <span className="code-string">&quot;@orbit/core&quot;</span>;{'\n'}
{'\n'}
<span className="code-keyword">const</span> <span className="code-variable">team</span> = <span className="code-keyword">new</span> <span className="code-variable">Workspace</span>({'{'}{'\n'}
  name: <span className="code-string">&quot;Engineering&quot;</span>,{'\n'}
  repositories: [<span className="code-string">&quot;frontend-main&quot;</span>, <span className="code-string">&quot;backend-api&quot;</span>]{'\n'}
{'}'});{'\n'}
{'\n'}
<span className="code-variable">team</span>.<span className="code-function">deploy</span>();
              </code></pre>
            </div>
          </div>
        </section>

        <section className="orbit-features">
          <div className="orbit-feature">
            <GitBranch size={32} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h3>Version Control</h3>
            <p>Seamlessly host and review code using the underlying Git integration.</p>
          </div>
          <div className="orbit-feature">
            <MessageSquare size={32} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h3>Issue Tracking</h3>
            <p>Keep your engineering work organized and tightly coupled with your codebase.</p>
          </div>
          <div className="orbit-feature">
            <Users size={32} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h3>Collaboration</h3>
            <p>Review pull requests, comment on diffs, and ship faster together.</p>
          </div>
        </section>
      </main>

      <footer className="orbit-landing-footer">
        <p>&copy; {new Date().getFullYear()} ORBIT. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

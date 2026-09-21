import React from 'react';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EmptyState from "../ui/EmptyState";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

const GlobalSearch = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/repo/all`);
        setRepositories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching repos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const filtered = repositories.filter(repo => 
    repo.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)', marginBottom: '16px' }}>Explore Repositories</h1>
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all ORBIT repositories..."
          style={{ maxWidth: '400px' }}
        />
      </header>
      
      {loading ? (
        <div className="orbit-skeleton-card" style={{ height: '100px' }}><div className="skeleton-line"></div></div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="No repositories found"
          description="Try adjusting your search query."
        />
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filtered.map(repo => (
            <Link key={repo._id} to={`/repo/${repo._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                padding: '24px', 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-primary)' }}>{repo.name}</h3>
                  <Badge variant="neutral">Public</Badge>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{repo.description || "No description provided."}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

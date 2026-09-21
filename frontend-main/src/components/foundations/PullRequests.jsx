import React from 'react';
import EmptyState from "../ui/EmptyState";

const PullRequests = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}>Pull Requests</h1>
      </header>
      
      <EmptyState 
        title="No pull requests yet"
        description="You have no open pull requests. As you collaborate with your team, your review requests and authored PRs will be tracked here."
      />
    </div>
  );
};

export default PullRequests;

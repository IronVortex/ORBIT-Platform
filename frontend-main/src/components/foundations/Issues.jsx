import React from 'react';
import EmptyState from "../ui/EmptyState";

const Issues = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)' }}>Issues</h1>
      </header>
      
      <EmptyState 
        title="No issues found"
        description="There are currently no issues assigned to you. When issues are created and assigned across your repositories, they will appear here."
      />
    </div>
  );
};

export default Issues;

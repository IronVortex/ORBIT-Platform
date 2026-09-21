import React from "react";
const HeatMapProfile = () => {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.5 }}>
        {/* Subtle geometric visual instead of giant illustration */}
        ⬚ ⬚ ⬚
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
        No contribution activity yet
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', maxWidth: '400px', margin: '0 auto' }}>
        Your activity will appear here as you build and collaborate in ORBIT.
      </p>
    </div>
  );
};

export default HeatMapProfile;

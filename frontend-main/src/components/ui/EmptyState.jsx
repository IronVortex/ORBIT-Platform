import React from "react";
import Button from "../ui/Button";

const EmptyState = ({ title, description, actionText, onAction }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
      backgroundColor: 'transparent',
      border: '1px dashed var(--border-color)',
      borderRadius: '12px',
      margin: '24px 0'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5, color: 'var(--text-muted)' }}>
        ⬚ ⬚ ⬚
      </div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
        {description}
      </p>
      {actionText && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

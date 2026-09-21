import React from "react";
import EmptyState from "../ui/EmptyState";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'var(--font-weight-bold)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={28} /> Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View updates on your repositories and issues.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Mark all as read</button>
        </div>
      </header>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 24px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px', fontSize: '14px' }}>
          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Inbox</span>
          <span style={{ color: 'var(--text-secondary)' }}>Saved</span>
        </div>
        
        <div style={{ padding: '48px' }}>
          <EmptyState 
            title="All caught up!"
            description="You don't have any unread notifications right now."
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;

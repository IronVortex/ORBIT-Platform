import React from "react";
import EmptyState from "../ui/EmptyState";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'var(--font-weight-bold)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={28} /> Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your personal account and preferences.</p>
      </header>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        <aside style={{ width: '240px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['Profile', 'Account', 'Appearance', 'Notifications', 'Security'].map(item => (
              <button 
                key={item}
                style={{
                  background: item === 'Profile' ? 'var(--bg-surface-hover)' : 'transparent',
                  border: 'none',
                  padding: '10px 16px',
                  textAlign: 'left',
                  borderRadius: '8px',
                  color: item === 'Profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: item === 'Profile' ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  cursor: 'pointer'
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <div style={{ flexGrow: 1 }}>
          <EmptyState 
            title="Settings coming soon"
            description="We are currently building out the settings panel. For now, you can toggle your theme from the sidebar."
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;

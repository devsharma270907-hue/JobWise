import React from 'react';
import { useTheme, THEME_PRESETS } from '../../lib/theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';
import { Palette, Sun, Moon, Laptop, Check, Zap, Target } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { mode, setMode, accentColor, setAccentColor, setPreset } = useTheme();
  const { user } = useAuth();

  const tokensUsed = user?.aiUsage?.monthlyTokensUsed || 0;
  const tokensBudget = user?.aiUsage?.monthlyBudget || 200000;
  const tokenPercent = Math.min(100, Math.round((tokensUsed / tokensBudget) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Settings & Customization
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Personalize your appearance, color themes, career targets, and AI preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Appearance & Theme Card */}
        <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Theme & Colors</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Customize your display mode and dynamic brand palette
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem' }}>
              Display Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id as any)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Accent Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem' }}>
              Designer Color Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
              {THEME_PRESETS.map((preset) => {
                const isSelected = accentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    onClick={() => setPreset(preset.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--text-main)' : '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: preset.hex,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.name}
                    </span>
                    {isSelected && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Picker */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                Custom Color Picker
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Set any custom brand hex value
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                {accentColor.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Live Component Preview */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Live Theme Preview
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  boxShadow: '0 2px 8px -2px var(--primary-glow)',
                }}
              >
                Primary Button
              </button>
              <div
                style={{
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                }}
              >
                Accent Pill Badge
              </div>
            </div>
          </div>
        </div>

        {/* AI Quota & Account Targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Quota Card */}
          <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Monthly Budget</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Enforced server-side per-user token allocation
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {tokensUsed.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>tokens</span>
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Limit: {tokensBudget.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                height: '8px',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${tokenPercent}%`,
                  backgroundColor: tokenPercent > 85 ? 'var(--danger)' : 'var(--primary)',
                }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Resets automatically each month. Used for resume parsing, semantic matching, split-screen tailoring, and AI mock interviews.
            </p>
          </div>

          {/* Profile Targets */}
          <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Target size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Career Targets</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active role and compensation preferences</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Target Roles
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {user?.targetRoles && user.targetRoles.length > 0 ? (
                  user.targetRoles.map((role, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>None configured</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

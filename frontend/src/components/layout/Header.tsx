import React from 'react';
import { Sun, Moon, Laptop, Search, PlusCircle } from 'lucide-react';
import { useTheme, THEME_PRESETS } from '../../lib/theme/ThemeProvider';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const { mode, setMode, accentColor, setPreset } = useTheme();
  const navigate = useNavigate();

  const cycleMode = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  const getModeIcon = () => {
    if (mode === 'light') return <Sun size={17} style={{ color: '#f59e0b' }} />;
    if (mode === 'dark') return <Moon size={17} style={{ color: '#6366f1' }} />;
    return <Laptop size={17} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface-glass)',
        backdropFilter: 'blur(var(--backdrop-blur))',
        WebkitBackdropFilter: 'blur(var(--backdrop-blur))',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Quick Search Launcher */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 0.85rem',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-muted)',
          fontSize: '0.84rem',
          cursor: 'pointer',
          width: '260px',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Search size={15} style={{ color: 'var(--text-subtle)' }} />
        <span>Search jobs, apps, tools...</span>
        <kbd
          style={{
            marginLeft: 'auto',
            fontSize: '0.68rem',
            padding: '2px 6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-subtle)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      {/* Right Actions: Accent Color Swatches + Theme Toggle + Fast Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Quick Accent Switcher Dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
          title="Quick Theme Accent Colors"
        >
          {THEME_PRESETS.slice(0, 5).map((preset) => {
            const isSelected = accentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.id}
                onClick={() => setPreset(preset.id)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: preset.hex,
                  border: isSelected ? '2px solid var(--text-main)' : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                  padding: 0,
                }}
                title={preset.name}
              />
            );
          })}
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={cycleMode}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          title={`Theme Mode: ${mode} (Click to change)`}
        >
          {getModeIcon()}
        </button>

        {/* Action Button: Tailor New Application */}
        <button
          onClick={() => navigate('/jobs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.95rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px -2px var(--primary-glow)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <PlusCircle size={15} />
          <span>Tailor Application</span>
        </button>
      </div>
    </header>
  );
};

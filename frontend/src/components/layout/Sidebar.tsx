import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  FileText,
  Mic,
  TrendingUp,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Job Matches', icon: Briefcase },
    { to: '/applications', label: 'Application CRM', icon: Kanban },
    { to: '/resume', label: 'Resume & ATS', icon: FileText },
    { to: '/interview-prep', label: 'Mock Interview Studio', icon: Mic },
    { to: '/skill-gaps', label: 'Skill Roadmap', icon: TrendingUp },
    { to: '/freelance', label: 'Freelance Gigs', icon: Sparkles },
    { to: '/settings', label: 'Settings & Theme', icon: Settings },
  ];

  const tokensUsed = user?.aiUsage?.monthlyTokensUsed || 0;
  const tokensBudget = user?.aiUsage?.monthlyBudget || 200000;
  const tokenPercent = Math.min(100, Math.round((tokensUsed / tokensBudget) * 100));

  return (
    <aside
      style={{
        width: collapsed ? '80px' : '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width var(--transition-normal)',
        zIndex: 40,
      }}
    >
      {/* Brand Header with JobWise Logo */}
      <div
        style={{
          padding: '1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <NavLink
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            overflow: 'hidden',
          }}
        >
          <img
            src="/jobwise-logo.png"
            alt="JobWise"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                JobWise
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                AI Career Companion
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all var(--transition-fast)',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* AI Token Budget Indicator */}
      {!collapsed && (
        <div
          style={{
            margin: '0 0.75rem 0.75rem 0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.35rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={13} style={{ color: 'var(--primary)' }} /> AI Monthly Quota
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {tokenPercent}%
            </span>
          </div>
          <div
            style={{
              height: '5px',
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
                transition: 'width var(--transition-normal)',
              }}
            />
          </div>
        </div>
      )}

      {/* User Profile & Logout */}
      <div
        style={{
          padding: '0.85rem 0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {user?.role || 'Job Seeker'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

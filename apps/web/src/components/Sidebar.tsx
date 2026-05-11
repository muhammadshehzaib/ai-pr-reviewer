'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Cpu, Key, GitBranch, LogOut, History } from 'lucide-react';
import { api } from '../lib/api';
import { AuthUser } from '../lib/useAuth';

interface SidebarProps {
  user: AuthUser | null;
  isConnected?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Activity;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: Activity },
  { href: '/repositories', label: 'Repositories', Icon: GitBranch },
  { href: '/history', label: 'History', Icon: History },
  { href: '/vault', label: 'API Key Vault', Icon: Key },
];

export function Sidebar({ user, isConnected }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/');
    }
  }

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Cpu size={32} color="#00f2fe" />
        <h2 style={{ fontSize: '1.5rem' }}>
          AEON <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>AI</span>
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="nav-link"
              data-active={active ? 'true' : 'false'}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {typeof isConnected === 'boolean' && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? 'var(--success-glow)' : 'red',
              }}
            />
            {isConnected ? 'System Connected' : 'Offline'}
          </div>
        )}

        {user && (
          <div className="user-card">
            {user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.username} className="avatar" />
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.username}
              </div>
              <button onClick={handleLogout} className="link-button">
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
